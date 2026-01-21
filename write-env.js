const fs = require('fs');
const content = `DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ai_site_forge?schema=public"
JWT_SECRET="56caada9e67e96860d5402a16d0016a2ef17e3f6087965451631568288339591"
PORT=3000
NODE_ENV="development"
GEMINI_API_KEY="AIzaSyD2-1vJbYQMaV3kOi3TCIPBbmuLJe4"
`;
fs.writeFileSync('.env', content, 'utf8');
console.log('✅ .env written successfully');
