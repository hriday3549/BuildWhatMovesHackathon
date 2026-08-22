# Smart CPGRAMS MVP

## Run

```powershell
npm install
npm run dev
```

The location step requests browser GPS permission automatically, supports address search through Nominatim/OpenStreetMap, lets citizens click or drag a map pin, and requires an explicit pin confirmation before a complaint is submitted.

For production, route Nominatim requests through a backend or replace them with a commercial provider such as Google Maps or Mapbox; do not use public Nominatim for high-volume traffic.
