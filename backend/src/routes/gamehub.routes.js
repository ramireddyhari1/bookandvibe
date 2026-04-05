const express = require('express');
const { randomUUID } = require('crypto');

const router = express.Router();
const { FACILITIES, REVIEWS_BY_FACILITY } = require('../data/gamehub.data');

function toText(value, fallback = '') {
  if (value === undefined || value === null) return fallback;
  const text = String(value).trim();
  return text || fallback;
}

function toNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function toList(value, fallback = []) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return fallback;
}

function buildFacilityPayload(source = [], existing = {}) {
  const facility = {
    ...existing,
    name: toText(source.name, existing.name),
    type: toText(source.type, existing.type),
    location: toText(source.location, existing.location),
    venue: toText(source.venue, existing.venue),
    distance: toText(source.distance, existing.distance),
    rating: toNumber(source.rating, existing.rating ?? 0),
    reviewsCount: toNumber(source.reviewsCount, existing.reviewsCount ?? 0),
    pricePerHour: toNumber(source.pricePerHour, existing.pricePerHour ?? 0),
    unit: toText(source.unit, existing.unit || 'hr'),
    priceRange: toText(source.priceRange, existing.priceRange),
    image: toText(source.image, existing.image),
    description: toText(source.description, existing.description),
    phone: toText(source.phone, existing.phone),
    openHours: toText(source.openHours, existing.openHours),
    amenities: toList(source.amenities, existing.amenities || []),
    features: toList(source.features, existing.features || []),
    tags: toList(source.tags, existing.tags || []),
    gallery: toList(source.gallery, existing.gallery || []),
    battleModes: Array.isArray(source.battleModes) ? source.battleModes : existing.battleModes || [],
    slotTemplate: Array.isArray(source.slotTemplate) ? source.slotTemplate : existing.slotTemplate || [],
  };

  if (!facility.name || !facility.type || !facility.location || !facility.venue) {
    throw new Error('name, type, location, and venue are required');
  }

  if (!facility.image) {
    facility.image = 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1200';
  }

  return facility;
}

router.get('/facilities', (req, res) => {
  try {
    const { city, type, search } = req.query;

    let facilities = [...FACILITIES];

    if (city) {
      const normalized = String(city).toLowerCase();
      facilities = facilities.filter(
        (item) => item.location.toLowerCase().includes(normalized) || item.venue.toLowerCase().includes(normalized)
      );
    }

    if (type && type !== 'All') {
      facilities = facilities.filter((item) => item.type === type);
    }

    if (search) {
      const q = String(search).toLowerCase();
      facilities = facilities.filter(
        (item) => item.name.toLowerCase().includes(q) || item.venue.toLowerCase().includes(q)
      );
    }

    return res.json({ message: 'Success', data: facilities });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.get('/facilities/:id', (req, res) => {
  try {
    const facility = FACILITIES.find((item) => item.id === req.params.id);
    if (!facility) return res.status(404).json({ error: 'Facility not found' });

    return res.json({
      message: 'Success',
      data: {
        ...facility,
        reviews: REVIEWS_BY_FACILITY[facility.id] || [],
      },
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.get('/facilities/:id/reviews', (req, res) => {
  try {
    const facility = FACILITIES.find((item) => item.id === req.params.id);
    if (!facility) return res.status(404).json({ error: 'Facility not found' });

    return res.json({ message: 'Success', data: REVIEWS_BY_FACILITY[facility.id] || [] });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.post('/facilities', (req, res) => {
  try {
    const facility = buildFacilityPayload(req.body, {
      id: `fac-${randomUUID()}`,
      reviewsCount: 0,
      distance: '0 km away',
      pricePerHour: 0,
      unit: 'hr',
      features: [],
      amenities: [],
      tags: [],
      gallery: [],
      battleModes: [],
      slotTemplate: [],
    });

    FACILITIES.unshift(facility);

    return res.status(201).json({
      message: 'Facility created successfully',
      data: facility,
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

router.patch('/facilities/:id', (req, res) => {
  try {
    const facilityIndex = FACILITIES.findIndex((item) => item.id === req.params.id);
    if (facilityIndex === -1) return res.status(404).json({ error: 'Facility not found' });

    const updatedFacility = buildFacilityPayload(req.body, FACILITIES[facilityIndex]);
    FACILITIES[facilityIndex] = updatedFacility;

    return res.json({
      message: 'Facility updated successfully',
      data: updatedFacility,
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

router.delete('/facilities/:id', (req, res) => {
  try {
    const facilityIndex = FACILITIES.findIndex((item) => item.id === req.params.id);
    if (facilityIndex === -1) return res.status(404).json({ error: 'Facility not found' });

    const [deletedFacility] = FACILITIES.splice(facilityIndex, 1);
    delete REVIEWS_BY_FACILITY[deletedFacility.id];

    return res.json({
      message: 'Facility deleted successfully',
      data: deletedFacility,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
