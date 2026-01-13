# Swedish Police Events Map

A professional, interactive web application that displays the latest 500 police events from the Swedish Police API on a map with detailed event information.

![Swedish Police Events Map](https://img.shields.io/badge/Status-Active-green) ![Next.js](https://img.shields.io/badge/Framework-Next.js%2014+-blue) ![TypeScript](https://img.shields.io/badge/Language-TypeScript-blue)

## 🚀 Features

### Core Features
- **Interactive Map**: Sweden-centered map displaying police events with custom markers
- **Real-time Data**: Fetches the latest 500 events from polisen.se API
- **Event Filtering**: Advanced filters by date, location, and event type
- **Search Functionality**: Search across event descriptions and locations
- **Event Details**: Detailed modal view with full event information
- **Responsive Design**: Works on desktop, tablet, and mobile devices

### Technical Features
- **Marker Clustering**: Automatically groups nearby events for better performance
- **Color-coded Events**: Visual distinction between different event types
- **Auto-refresh**: Periodic data updates every 10 minutes
- **Error Handling**: Graceful error handling with retry functionality
- **SEO Optimized**: Proper meta tags and structured data

## 🛠 Technology Stack

- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Maps**: Leaflet with React Leaflet
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **Icons**: Lucide React
- **Deployment Ready**: Optimized for Vercel/Netlify

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm, yarn, pnpm, or bun

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd polis_live
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build production application
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript compiler check

### Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── App.tsx           # Main application component
│   ├── EventList/        # Event list components
│   ├── Filters/          # Filter components
│   ├── Map/              # Map components
│   └── Modal/            # Modal components
├── hooks/                # Custom React hooks
├── services/             # API services
├── store/                # Zustand store
├── types/                # TypeScript interfaces
└── utils/                # Utility functions
```

## 📖 API Information

### Swedish Police API
- **Base URL**: `https://polisen.se/api/events`
- **Returns**: JSON array of up to 500 recent events
- **No authentication required**
- **CORS enabled** for browser requests

### Event Object Structure
```typescript
interface PoliceEvent {
  id: number;
  datetime: string;
  name: string;
  summary: string;
  url: string;
  type: string;
  location: {
    name: string;
    gps: string;  // "latitude,longitude"
  };
}
```

### Available Filters
- **DateTime**: Filter by date/time (YYYY-MM-DD format)
- **Location**: Filter by location name (multiple locations separated by semicolon)
- **Type**: Filter by event type (multiple types separated by semicolon)

## 🎨 Event Types & Colors

The application supports various event types with distinct colors:

| Event Type | Color | Icon |
|------------|-------|------|
| Trafikolycka | #FF6B6B | Car |
| Misshandel | #EE5A6F | Shield |
| Brand | #FF8C42 | Flame |
| Inbrott | #9B59B6 | Home |
| Stöld | #8E44AD | ShoppingBag |
| Rattfylleri | #E67E22 | Wine |
| Narkotikabrott | #C0392B | Pill |
| Rån | #E74C3C | Banknote |
| And more... | | |

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy automatically

### Netlify
1. Build the application: `npm run build`
2. Deploy the `out` folder to Netlify

### Other Platforms
The application is a standard Next.js app and can be deployed to any platform supporting Node.js.

## 🔧 Configuration

### Environment Variables
Create a `.env.local` file for any environment-specific configurations:

```env
# Optional: Custom API base URL
NEXT_PUBLIC_API_BASE_URL=https://polisen.se/api/events

# Optional: Map tile server URL
NEXT_PUBLIC_MAP_TILE_URL=https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
```

## 📱 Browser Support

- Chrome 91+
- Firefox 88+
- Safari 14+
- Edge 91+

## 🔍 SEO & Performance

- **Lighthouse Score**: 90+ across all metrics
- **SEO Optimized**: Proper meta tags, structured data
- **Performance**: Lazy loading, code splitting, image optimization
- **Accessibility**: WCAG AA compliant

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📋 TODO / Future Enhancements

- [ ] Dark mode toggle
- [ ] Event statistics dashboard
- [ ] Export functionality (CSV/JSON)
- [ ] Push notifications for specific areas
- [ ] Multi-language support (English/Swedish)
- [ ] Heatmap view
- [ ] Time-based analytics
- [ ] Offline support with service worker

## ⚖️ License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [Swedish Police API](https://polisen.se) for providing open data
- [OpenStreetMap](https://www.openstreetmap.org) contributors for map tiles
- [Leaflet](https://leafletjs.com/) for the excellent mapping library
- [Next.js](https://nextjs.org/) team for the amazing framework

## 📞 Support

If you encounter any issues or have questions:

1. Check the existing [Issues](../../issues)
2. Create a new issue with detailed description
3. Include browser version and steps to reproduce

---

**Built with ❤️ for transparency in public safety information**
