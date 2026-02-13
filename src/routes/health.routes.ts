import { Router, Request, Response } from 'express';
import { ReviewService } from '../services/review.service';

const router = Router();
const reviewService = new ReviewService();

router.get('/health', async (req: Request, res: Response) => {
  try {
    const services = await reviewService.checkServices();

    const allHealthy = Object.values(services).every(status => status);

    res.status(allHealthy ? 200 : 503).json({
      status: allHealthy ? 'healthy' : 'unhealthy',
      services,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: 'Failed to check services',
      timestamp: new Date().toISOString(),
    });
  }
});

router.get('/', (req: Request, res: Response) => {
  res.json({
    name: 'OpenReview',
    version: '1.0.0',
    description: 'Automated code review using local LLMs',
    endpoints: {
      health: '/health',
      webhook: '/webhook/github',
    },
  });
});

export default router;
