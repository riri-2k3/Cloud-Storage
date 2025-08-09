// Updated CORS configuration in server.js
const allowedOrigins = [
    'http://localhost:3000',                    // Local development
    'http://localhost:3001',                    // Alternative local port
    'https://riris-cloud-storage.vercel.app',   // Production frontend
    'https://riris-cloud-storage-git-main-riris-projects.vercel.app', // Vercel preview URLs
    
    // More permissive patterns for Vercel
    /^https:\/\/riris-cloud-storage.*\.vercel\.app$/,  // Any riris-cloud-storage subdomain
    /^https:\/\/cloud-storage.*\.vercel\.app$/,        // Any cloud-storage subdomain
    /^https:\/\/.*riris-projects.*\.vercel\.app$/      // Any domain with riris-projects
];

// Add CLIENT_URL if provided (for additional environments)
if (process.env.CLIENT_URL) {
    allowedOrigins.push(process.env.CLIENT_URL);
}

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin) return callback(null, true);
        
        console.log(`🔍 CORS check for origin: ${origin}`); // Debug log
        
        // Check if origin matches allowed patterns
        const isAllowed = allowedOrigins.some(allowedOrigin => {
            if (typeof allowedOrigin === 'string') {
                if (allowedOrigin.includes('*')) {
                    // Handle wildcard patterns
                    const pattern = allowedOrigin.replace('*', '.*');
                    const regex = new RegExp(`^${pattern}$`);
                    return regex.test(origin);
                }
                return allowedOrigin === origin;
            } else if (allowedOrigin instanceof RegExp) {
                // Handle regex patterns
                return allowedOrigin.test(origin);
            }
            return false;
        });
        
        if (isAllowed) {
            console.log(`✅ CORS allowed for: ${origin}`); // Debug log
            callback(null, true);
        } else {
            console.log(`❌ CORS blocked origin: ${origin}`); // Debug log
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
        'Origin',
        'X-Requested-With', 
        'Content-Type', 
        'Accept',
        'Authorization'
    ],
    exposedHeaders: ['Content-Length', 'X-Foo', 'X-Bar'],
    maxAge: 86400 // 24 hours preflight cache
}));