import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [
      react(), 
      tailwindcss(),
      {
        name: 'youtube-proxy',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            if (req.url && req.url.includes('/api/youtube-proxy')) {
              try {
                const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
                const videoId = url.searchParams.get('videoId');
                if (!videoId) {
                  res.statusCode = 400;
                  res.end('Missing videoId parameter');
                  return;
                }
                
                // Fetch the streaming URL using @distube/ytdl-core dynamically
                const ytdl = (await import('@distube/ytdl-core')).default;
                const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
                
                res.setHeader('Content-Type', 'video/mp4');
                res.setHeader('Access-Control-Allow-Origin', '*');
                
                const stream = ytdl(videoUrl, {
                  filter: 'audioandvideo',
                  quality: 'highest'
                });
                
                stream.on('error', (err) => {
                  console.error("ytdl streaming error:", err);
                  if (!res.headersSent) {
                    res.statusCode = 500;
                    res.end('Streaming error: ' + err.message);
                  }
                });
                
                stream.pipe(res);
              } catch (err) {
                console.error("Vite proxy middleware error:", err);
                if (!res.headersSent) {
                  res.statusCode = 500;
                  res.end('Server error: ' + err.message);
                }
              }
            } else {
              next();
            }
          });
        }
      }
    ],
    base: '/-ai-class/',
    define: {
      'process.env.YOUTUBE_API_KEY': JSON.stringify(env.YOUTUBE_API_KEY || process.env.YOUTUBE_API_KEY || ''),
    }
  };
})

