// src/app/api/geocode/route.js
import { NextResponse } from "next/server";

const GOOGLE_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

function pickComponent(components, types) {
  const found = components.find((c) => types.every((t) => c.types.includes(t)));
  return found ? found.long_name : null;
}

export async function POST(req) {
  try {
    const body = await req.json();

    if (!GOOGLE_KEY) {
      return NextResponse.json({ error: "API key not configured" }, { status: 500 });
    }

    let url;
    if (body.address) {
      const q = encodeURIComponent(body.address);
      url = `https://maps.googleapis.com/maps/api/geocode/json?address=${q}&key=${GOOGLE_KEY}&language=es`;
    } else if (body.lat != null && body.lng != null) {
      url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${body.lat},${body.lng}&key=${GOOGLE_KEY}&language=es`;
    } else {
      return NextResponse.json({ error: "address or lat/lng required" }, { status: 400 });
    }

    const res = await fetch(url);
    const data = await res.json();

    if (!data.results || data.results.length === 0) {
      return NextResponse.json({ error: "No results" }, { status: 404 });
    }

    const result = data.results[0];
    const components = result.address_components || [];

    const city =
      pickComponent(components, ["locality"]) ||
      pickComponent(components, ["administrative_area_level_2"]) ||
      pickComponent(components, ["administrative_area_level_1"]) ||
      null;

    const neighborhood =
      pickComponent(components, ["neighborhood"]) ||
      pickComponent(components, ["sublocality"]) ||
      null;

    const department =
      pickComponent(components, ["administrative_area_level_1"]) || null;

    const country = pickComponent(components, ["country"]) || null;

    const postalCode = pickComponent(components, ["postal_code"]) || null;

    const route = pickComponent(components, ["route"]);
    const street_number = pickComponent(components, ["street_number"]);
    const street = [route, street_number].filter(Boolean).join(" ").trim() || null;

    const location =
      result.geometry && result.geometry.location ? result.geometry.location : null;

    return NextResponse.json({
      formattedAddress: result.formatted_address || null,
      city,
      neighborhood,
      department,
      country,
      postalCode,
      placeId: result.place_id || null,
      street,
      lat: location?.lat ?? null,
      lng: location?.lng ?? null,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
