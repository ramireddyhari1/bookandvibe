INSERT INTO "User" (id, name, email, password, role, "createdAt", "updatedAt") 
VALUES ('c4a23b32-1234-5678-abcd-123456789abc', 'IndulgeOut Official', 'host@indulgeout.com', 'secure', 'PARTNER', NOW(), NOW())
ON CONFLICT DO NOTHING;

INSERT INTO "Event" (id, title, description, category, location, venue, date, time, price, "totalSlots", "availableSlots", images, status, featured, "createdAt", "updatedAt", "partnerId")
VALUES 
('d5a23b32-1111-5678-abcd-123456789ab1', 'Neon Paint & Sip Party', 'Unleash your creativity under UV lights with friends and drinks.', 'WORKSHOP', 'Downtown Art Studio', 'The Canvas Room', NOW() + INTERVAL '3 days', '19:00', 49.99, 30, 15, '["https://images.unsplash.com/photo-1543857778-c4a1a3e0b2eb?q=80&w=1000"]', 'APPROVED', true, NOW(), NOW(), 'c4a23b32-1234-5678-abcd-123456789abc'),
('d5a23b32-2222-5678-abcd-123456789ab2', 'Weekend Singles Mixer', 'Meet exciting new people in a relaxed environment.', 'NIGHTLIFE', 'Skyline Lounge', 'Rooftop Bar & Grill', NOW() + INTERVAL '5 days', '20:30', 25.00, 100, 80, '["https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=1000"]', 'APPROVED', true, NOW(), NOW(), 'c4a23b32-1234-5678-abcd-123456789abc'),
('d5a23b32-3333-5678-abcd-123456789ab3', 'Sip & Sculpt Clay Workshop', 'Learn the basics of pottery while enjoying your favorite wine.', 'WORKSHOP', 'Creative Hive', 'Main Hall', NOW() + INTERVAL '7 days', '18:00', 55.00, 20, 5, '["https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=1000"]', 'APPROVED', false, NOW(), NOW(), 'c4a23b32-1234-5678-abcd-123456789abc')
ON CONFLICT DO NOTHING;
