const events = [
    {
      title: "Neon Paint & Sip Party",
      description: "Unleash your creativity under UV lights with friends and drinks! All painting materials will be provided.",
      category: "WORKSHOP",
      location: "Downtown",
      venue: "The Canvas Room",
      date: new Date(Date.now() + 86400000 * 3).toISOString(),
      time: "19:00",
      price: 49.99,
      totalSlots: 30,
      image: "https://images.unsplash.com/photo-1543857778-c4a1a3e0b2eb?q=80&w=1000"
    },
    {
      title: "Weekend Singles Mixer",
      description: "Meet exciting new people in a relaxed, fun environment with curated icebreakers.",
      category: "NIGHTLIFE",
      location: "Skyline Lounge",
      venue: "Rooftop Bar",
      date: new Date(Date.now() + 86400000 * 5).toISOString(),
      time: "20:30",
      price: 25.00,
      totalSlots: 100,
      image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=1000"
    },
    {
      title: "Sip & Sculpt Clay Workshop",
      description: "Learn the basics of pottery while enjoying your favorite drinks. Take your creation home!",
      category: "WORKSHOP",
      location: "Creative Arts Center",
      venue: "Main Studio",
      date: new Date(Date.now() + 86400000 * 7).toISOString(),
      time: "18:00",
      price: 55.00,
      totalSlots: 20,
      image: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=1000"
    },
    {
      title: "Sunset Kayaking Adventure",
      description: "Enjoy a peaceful kayaking trip during the beautiful golden hour. No prior experience needed.",
      category: "ADVENTURE",
      location: "Riverfront",
      venue: "Water Sports Club",
      date: new Date(Date.now() + 86400000 * 10).toISOString(),
      time: "17:30",
      price: 35.00,
      totalSlots: 15,
      image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=1000"
    }
  ];

async function seed() {
    for (const ev of events) {
        try {
            const res = await fetch('http://localhost:5000/api/events', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(ev)
            });
            console.log(await res.json());
        } catch (e) {
            console.error(e.message);
        }
    }
}

seed();
