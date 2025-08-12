import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { rentRollQueries } from "./rent-roll-queries";

export function registerRoutes(app: Express): Server {
  // Export metrics data (must be before /api/metrics/:type)
  app.get("/api/metrics/export", async (req, res) => {
    try {
      console.log('Export endpoint called - fetching data...');
      const metrics = await storage.getMetrics();
      const vacancyDistribution = await storage.getVacancyDistribution();
      
      console.log(`Export data: ${metrics.length} metrics, ${vacancyDistribution.length} vacancy records`);
      
      const exportData = {
        metrics,
        vacancyDistribution,
        exportedAt: new Date().toISOString(),
        propertyManager: "Augusta Rental Homes",
        dataVersion: "1.0"
      };

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename="augusta-rental-metrics.json"');
      
      console.log('Sending export response...');
      res.json(exportData);
    } catch (error) {
      console.error('Export error:', error);
      res.status(500).json({ error: "Failed to export metrics", details: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Get all metrics
  app.get("/api/metrics", async (req, res) => {
    try {
      const metrics = await storage.getMetrics();
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch metrics" });
    }
  });

  // Get metrics by type
  app.get("/api/metrics/:type", async (req, res) => {
    try {
      const { type } = req.params;
      const metrics = await storage.getMetricsByType(type);
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch metrics by type" });
    }
  });

  // Update a specific metric
  app.put("/api/metrics/:type/:propertyType", async (req, res) => {
    try {
      const { type, propertyType } = req.params;
      const updateSchema = z.object({
        value: z.number(),
        stringValue: z.string().optional(),
      });

      const { value, stringValue } = updateSchema.parse(req.body);
      const updatedMetric = await storage.updateMetric(type, propertyType, value, stringValue);
      res.json(updatedMetric);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid request data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to update metric" });
      }
    }
  });

  // Get vacancy distribution
  app.get("/api/vacancy-distribution", async (req, res) => {
    try {
      const distributions = await storage.getVacancyDistribution();
      res.json(distributions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch vacancy distribution" });
    }
  });

  // Update vacancy distribution
  app.put("/api/vacancy-distribution/:propertyType", async (req, res) => {
    try {
      const { propertyType } = req.params;
      const updateSchema = z.array(z.object({
        daysRange: z.string(),
        count: z.number(),
      }));

      const distributions = updateSchema.parse(req.body);
      await storage.updateVacancyDistribution(propertyType, distributions);
      res.json({ success: true });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid request data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to update vacancy distribution" });
      }
    }
  });

  // Refresh occupancy data from Buildium
  app.post("/api/metrics/refresh-occupancy", async (req, res) => {
    try {
      console.log('Starting occupancy refresh from Buildium...');
      const result = await storage.refreshOccupancyFromBuildium();
      
      if (result.success) {
        res.json({
          success: true,
          message: "Occupancy rates refreshed successfully from Buildium",
          data: result.data,
          lastUpdated: new Date().toISOString()
        });
      } else {
        res.status(500).json({
          success: false,
          error: result.error,
          message: "Failed to refresh occupancy rates from Buildium"
        });
      }
    } catch (error) {
      console.error('Error in refresh-occupancy route:', error);
      res.status(500).json({ 
        success: false,
        error: "Failed to refresh occupancy data from Buildium",
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Refresh rent metrics from Buildium
  app.post("/api/metrics/refresh-rent", async (req, res) => {
    try {
      console.log('Starting rent metrics refresh from Buildium...');
      const result = await storage.refreshRentMetricsFromBuildium();
      
      if (result.success) {
        res.json({
          success: true,
          message: "Rent metrics refreshed successfully from Buildium",
          data: result.data,
          lastUpdated: new Date().toISOString()
        });
      } else {
        res.status(500).json({
          success: false,
          error: result.error,
          message: "Failed to refresh rent metrics from Buildium"
        });
      }
    } catch (error) {
      console.error('Error in refresh-rent route:', error);
      res.status(500).json({ 
        success: false,
        error: "Failed to refresh rent metrics from Buildium",
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Refresh occupancy term metrics from Buildium
  app.post("/api/metrics/refresh-occupancy-term", async (req, res) => {
    try {
      console.log('Starting occupancy term metrics refresh from Buildium...');
      const result = await storage.refreshOccupancyTermFromBuildium();
      
      if (result.success) {
        res.json({
          success: true,
          message: "Occupancy term metrics refreshed successfully from Buildium",
          data: result.data,
          lastUpdated: new Date().toISOString()
        });
      } else {
        res.status(500).json({
          success: false,
          error: result.error,
          message: "Failed to refresh occupancy term metrics from Buildium"
        });
      }
    } catch (error) {
      console.error('Error in refresh-occupancy-term route:', error);
      res.status(500).json({ 
        success: false,
        error: "Failed to refresh occupancy term metrics from Buildium",
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Refresh early terminations metrics from Buildium
  app.post("/api/metrics/refresh-early-terminations", async (req, res) => {
    try {
      console.log('Starting early terminations metrics refresh from Buildium...');
      const result = await storage.refreshEarlyTerminationsFromBuildium();
      
      if (result.success) {
        res.json({
          success: true,
          message: "Early terminations metrics refreshed successfully from Buildium",
          data: result.data,
          lastUpdated: new Date().toISOString()
        });
      } else {
        res.status(500).json({
          success: false,
          error: result.error,
          message: "Failed to refresh early terminations metrics from Buildium"
        });
      }
    } catch (error) {
      console.error('Error in refresh-early-terminations route:', error);
      res.status(500).json({ 
        success: false,
        error: "Failed to refresh early terminations metrics from Buildium",
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Refresh month-to-month metrics from Buildium
  app.post("/api/metrics/refresh-month-to-month", async (req, res) => {
    try {
      console.log('Starting month-to-month metrics refresh from Buildium...');
      const result = await storage.refreshMonthToMonthFromBuildium();
      
      if (result.success) {
        res.json({
          success: true,
          message: "Month-to-month metrics refreshed successfully from Buildium",
          data: result.data,
          lastUpdated: new Date().toISOString()
        });
      } else {
        res.status(500).json({
          success: false,
          error: result.error,
          message: "Failed to refresh month-to-month metrics from Buildium"
        });
      }
    } catch (error) {
      console.error('Error in refresh-month-to-month route:', error);
      res.status(500).json({ 
        success: false,
        error: "Failed to refresh month-to-month metrics from Buildium",
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Refresh owner length metrics from Buildium
  app.post("/api/metrics/refresh-owner-length", async (req, res) => {
    try {
      console.log('Starting owner length metrics refresh from Buildium...');
      const result = await storage.refreshOwnerLengthFromBuildium();
      
      if (result.success) {
        res.json({
          success: true,
          message: "Owner length metrics refreshed successfully from Buildium",
          data: result.data,
          lastUpdated: new Date().toISOString()
        });
      } else {
        res.status(500).json({
          success: false,
          error: result.error,
          message: "Failed to refresh owner length metrics from Buildium"
        });
      }
    } catch (error) {
      console.error('Error in refresh-owner-length route:', error);
      res.status(500).json({ 
        success: false,
        error: "Failed to refresh owner length metrics from Buildium",
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Refresh outside owners metrics from Buildium
  app.post("/api/metrics/refresh-outside-owners", async (req, res) => {
    try {
      console.log('Starting outside owners metrics refresh from Buildium...');
      const result = await storage.refreshOutsideOwnersFromBuildium();
      
      if (result.success) {
        res.json({
          success: true,
          message: "Outside owners metrics refreshed successfully from Buildium",
          data: result.data,
          lastUpdated: new Date().toISOString()
        });
      } else {
        res.status(500).json({
          success: false,
          error: result.error,
          message: "Failed to refresh outside owners metrics from Buildium"
        });
      }
    } catch (error) {
      console.error('Error in refresh-outside-owners route:', error);
      res.status(500).json({ 
        success: false,
        error: "Failed to refresh outside owners metrics from Buildium",
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Refresh leases signed metrics from Buildium
  app.post("/api/metrics/refresh-leases-signed", async (req, res) => {
    try {
      console.log('Starting leases signed metrics refresh from Buildium...');
      const result = await storage.refreshLeasesSignedFromBuildium();
      
      if (result.success) {
        res.json({
          success: true,
          message: "Leases signed metrics refreshed successfully from Buildium",
          data: result.data,
          lastUpdated: new Date().toISOString()
        });
      } else {
        res.status(500).json({
          success: false,
          error: result.error,
          message: "Failed to refresh leases signed metrics from Buildium"
        });
      }
    } catch (error) {
      console.error('Error in refresh-leases-signed route:', error);
      res.status(500).json({ 
        success: false,
        error: "Failed to refresh leases signed metrics from Buildium",
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Refresh average days on market metrics from Buildium
  app.post("/api/metrics/refresh-days-on-market", async (req, res) => {
    try {
      console.log('Starting average days on market metrics refresh from Buildium...');
      const result = await storage.refreshDaysOnMarketFromBuildium();
      
      if (result.success) {
        res.json({
          success: true,
          message: "Average days on market metrics refreshed successfully from Buildium",
          data: result.data,
          lastUpdated: new Date().toISOString()
        });
      } else {
        res.status(500).json({
          success: false,
          error: result.error,
          message: "Failed to refresh average days on market metrics from Buildium"
        });
      }
    } catch (error) {
      console.error('Error in refresh-days-on-market route:', error);
      res.status(500).json({ 
        success: false,
        error: "Failed to refresh average days on market metrics from Buildium",
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Refresh vacancy distribution from Buildium
  app.post("/api/vacancy-distribution/refresh", async (req, res) => {
    try {
      console.log('Starting vacancy distribution refresh from Buildium...');
      const result = await storage.refreshVacancyDistributionFromBuildium();
      
      if (result.success) {
        res.json({
          success: true,
          message: "Vacancy distribution refreshed successfully from Buildium",
          data: result.data,
          lastUpdated: new Date().toISOString()
        });
      } else {
        res.status(500).json({
          success: false,
          error: result.error,
          message: "Failed to refresh vacancy distribution from Buildium"
        });
      }
    } catch (error) {
      console.error('Error in refresh vacancy distribution route:', error);
      res.status(500).json({ 
        success: false,
        error: "Failed to refresh vacancy distribution from Buildium",
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Refresh all metrics from Buildium
  app.post("/api/metrics/refresh", async (req, res) => {
    try {
      console.log('Starting refresh of all metrics from Buildium...');
      
      // Call all individual refresh methods
      const refreshPromises = [
        storage.refreshOccupancyFromBuildium(),
        storage.refreshRentMetricsFromBuildium(),
        storage.refreshOccupancyTermFromBuildium(),
        storage.refreshEarlyTerminationsFromBuildium(),
        storage.refreshMonthToMonthFromBuildium(),
        storage.refreshOwnerLengthFromBuildium(),
        storage.refreshOutsideOwnersFromBuildium(),
        storage.refreshLeasesSignedFromBuildium(),
        storage.refreshDaysOnMarketFromBuildium(),
        storage.refreshVacancyDistributionFromBuildium()
      ];

      const results = await Promise.all(refreshPromises);
      
      // Check if any refresh failed
      const failedRefreshes = results.filter((result: any) => !result.success);
      
      if (failedRefreshes.length > 0) {
        console.log(`${failedRefreshes.length} metrics failed to refresh`);
        res.status(207).json({ 
          success: false,
          message: `${results.length - failedRefreshes.length}/${results.length} metrics refreshed successfully`,
          partialSuccess: true,
          failedCount: failedRefreshes.length,
          lastUpdated: new Date().toISOString()
        });
      } else {
        console.log('All metrics refreshed successfully from Buildium');
        res.json({ 
          success: true, 
          message: "All metrics refreshed successfully from Buildium",
          refreshedCount: results.length,
          lastUpdated: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error refreshing all metrics:', error);
      res.status(500).json({ 
        success: false,
        error: "Failed to refresh metrics from Buildium",
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });



  // NEW: Get operational metrics from database (fast)
  app.get("/api/metrics/operational/database", async (req, res) => {
    try {
      console.log('Fetching operational metrics from database...');
      const metrics = await rentRollQueries.getAllOperationalMetrics();
      res.json({
        success: true,
        source: 'database',
        data: metrics,
        lastUpdated: metrics.lastUpdate
      });
    } catch (error) {
      console.error('Error fetching database metrics:', error);
      res.status(500).json({ 
        success: false,
        error: "Failed to fetch metrics from database",
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // NEW: Refresh database from CSV upload
  app.post("/api/database/import-csv", async (req, res) => {
    try {
      // This endpoint would handle CSV file upload and import
      // For now, return instructions
      res.json({
        message: "CSV import endpoint - use Supabase dashboard to import Rent_Roll.csv",
        instructions: [
          "1. Export Rent Roll from Buildium",
          "2. Go to Supabase Table Editor",
          "3. Select rent_roll table",
          "4. Click Import CSV",
          "5. Upload the file"
        ]
      });
    } catch (error) {
      res.status(500).json({ error: "CSV import failed" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
