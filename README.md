# Smart CPGRAMS MVP

## Run

```powershell
npm install
npm run dev
```

The location step requests browser GPS permission automatically, supports address search through Nominatim/OpenStreetMap, lets citizens click or drag a map pin, and requires an explicit pin confirmation before a complaint is submitted.

The prototype also includes rule-based department classification, Haversine duplicate detection using category, location proximity, and a 48-hour window, community parent complaints, live SLA messaging, automatic mock escalation, officer evidence submission, and citizen verification. Duplicate reports remain traceable as child tickets while the officer workflow operates on the single parent complaint.

## Officer → citizen verification demo

After filing a ticket, select **Open officer completion demo** (or use **Officer demo** in the header), then attach the original completion photo. The app reads the image’s EXIF metadata and rejects it unless it contains both embedded GPS coordinates and an original capture time. The ticket moves to **Pending verification** only after that validation passes. Track the ticket as a citizen to review the image, location, and timestamp, then accept the resolution or reject it to reopen the issue.

For production, route Nominatim requests through a backend or replace them with a commercial provider such as Google Maps or Mapbox; do not use public Nominatim for high-volume traffic.

See [PROJECT_AUDIT.md](PROJECT_AUDIT.md), [ARCHITECTURE.md](ARCHITECTURE.md), [API.md](API.md), [DATABASE.md](DATABASE.md), and [IMPLEMENTATION_STATUS.md](IMPLEMENTATION_STATUS.md) for the audit, service contract, production database plan, and verification status. This is a concept prototype and is not officially connected to CPGRAMS.
