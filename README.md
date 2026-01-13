# Daniels Polisradar 🚔

A professional, interactive web application that displays real-time police events from the Swedish Police API with an engaging map interface and comprehensive filtering capabilities.

![Swedish Police Events Map](https://img.shields.io/badge/Status-Live-green) ![Next.js](https://img.shields.io/badge/Framework-Next.js%2014+-blue) ![TypeScript](https://img.shields.io/badge/Language-TypeScript-blue) ![Mobile](https://img.shields.io/badge/Mobile-Optimized-purple)

## 🌟 Features

### Core Features
- **🗺️ Interactive Map**: Sweden-centered Leaflet map with custom police event markers
- **📱 Mobile-First Design**: Responsive design with dedicated mobile view toggle
- **🔄 Real-time Updates**: Auto-refreshing police events every 10 minutes
- **🔍 Advanced Filtering**: Filter by date, location, and event type
- **📍 Event Details**: Comprehensive modal view with full event information
- **📰 Live News Ticker**: Animated ticker showing latest police events
- **🎯 Touch-Optimized**: Mobile-friendly controls and interactions

### Mobile Experience
- **View Toggle**: Seamless switching between map and list views on mobile
- **Touch Controls**: Optimized map controls for mobile devices
- **Bottom Sheet**: Mobile-friendly event details presentation
- **Fixed Header**: Logo and live ticker always visible

### Technical Features
- **🔗 Marker Clustering**: Groups nearby events for better performance
- **🎨 Color-coded Events**: Visual distinction between different event types
- **⚡ Performance Optimized**: Lazy loading and efficient state management
- **🛡️ Error Handling**: Graceful error handling with retry functionality
- **🔍 SEO Ready**: Proper meta tags and structured data

## 🛠 Technology Stack

- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with mobile-first approach
- **Maps**: Leaflet with React Leaflet for interactive mapping
- **State Management**: Zustand for lightweight state management
- **Data Fetching**: TanStack Query with caching and auto-refresh
- **Icons**: Lucide React for consistent iconography
- **Animations**: Custom CSS animations and transitions

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
│   ├── globals.css        # Global styles with animations
│   ├── layout.tsx         # Root layout with metadata
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── App.tsx           # Main app with mobile/desktop layouts
│   ├── EventList/        # Event list with mobile optimization
│   ├── Filters/          # Advanced filtering interface
│   ├── Logo/             # Animated header with news ticker
│   ├── Map/              # Interactive map with touch controls
│   └── Modal/            # Event details modal
├── hooks/                # Custom React hooks for data fetching
├── services/             # API services and data transformation
├── store/                # Zustand store with mobile view state
├── types/                # TypeScript interfaces
└── utils/                # Utility functions and helpers
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

##  Configuration

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

- [x] ✅ Mobile-first responsive design
- [x] ✅ Interactive map with touch controls
- [x] ✅ Mobile view toggle (map/list)
- [x] ✅ Animated logo and news ticker
- [ ] 🌙 Dark mode toggle
- [ ] 📊 Event statistics dashboard
- [ ] 📁 Export functionality (CSV/JSON)
- [ ] 🔔 Push notifications for specific areas
- [ ] 🌍 Multi-language support (English/Swedish)
- [ ] 🔥 Heatmap view
- [ ] 📈 Time-based analytics
- [ ] 📱 Progressive Web App (PWA) support

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

**Daniels Polisradar - Built with ❤️ for transparency in public safety information**
