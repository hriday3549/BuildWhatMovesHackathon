# Smart CPGRAMS MVP

## Run

```powershell
npm install
npm run dev
```

The location step requests browser GPS permission automatically, supports address search through Nominatim/OpenStreetMap, lets citizens click or drag a map pin, and requires an explicit pin confirmation before a complaint is submitted.

## Officer → citizen verification demo

After filing a ticket, select **Open officer completion demo** (or use **Officer demo** in the header), then attach the original completion photo. The app reads the image’s EXIF metadata and rejects it unless it contains both embedded GPS coordinates and an original capture time. The ticket moves to **Pending verification** only after that validation passes. Track the ticket as a citizen to review the image, location, and timestamp, then accept the resolution or reject it to reopen the issue.

For production, route Nominatim requests through a backend or replace them with a commercial provider such as Google Maps or Mapbox; do not use public Nominatim for high-volume traffic.
