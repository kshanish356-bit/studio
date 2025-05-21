
// /src/app/api/driver/rides/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define the Ride type, consistent with frontend
interface Ride {
  id: string;
  from: string;
  to: string;
  time: string;
  status: 'Pending' | 'Accepted' | 'Ongoing' | 'Completed' | 'Cancelled';
  fare?: string;
  driverUid?: string; // Optional: for future real backend
  passengerId?: string; // Optional: for future real backend
}

// Mock database for rides
let mockRides: Ride[] = [
  { id: '1', from: 'Bhopal New Market', to: 'Indore Airport', time: '10:00 AM', status: 'Accepted', fare: '₹1800' },
  { id: '2', from: 'MP Nagar Zone 2', to: 'Bhopal Railway Station', time: '12:30 PM', status: 'Pending', fare: '₹250' },
  { id: '3', from: 'Airport Road', to: 'City Center Mall', time: '03:15 PM', status: 'Ongoing', fare: '₹300' },
  { id: '4', from: 'Van Vihar National Park', to: 'Upper Lake View Point', time: '05:00 PM', status: 'Completed', fare: '₹150' },
  { id: '5', from: 'Lake View', to: 'DB Mall', time: 'Yesterday 08:00 PM', status: 'Completed', fare: '₹220' },
  { id: '6', from: 'ISBT Bhopal', to: 'Kolar Road', time: 'Two days ago 11:00 AM', status: 'Completed', fare: '₹450' },
  { id: '7', from: 'Ashoka Garden', to: 'BHEL Township', time: '09:00 AM Tomorrow', status: 'Pending', fare: '₹180' },
  { id: '8', from: 'Habibganj Station', to: 'MANIT Campus', time: '11:00 AM Tomorrow', status: 'Accepted', fare: '₹120' },
];

export async function GET(request: NextRequest) {
  // In a real app, you'd get driverUid from authenticated session
  // const driverUid = request.headers.get('x-driver-uid'); // Example
  // And filter rides: mockRides.filter(ride => ride.driverUid === driverUid)
  try {
    return NextResponse.json(mockRides);
  } catch (error) {
    console.error("Error fetching rides:", error);
    return NextResponse.json({ message: "Failed to fetch rides", error: (error as Error).message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { rideId, newStatus } = await request.json();

    if (!rideId || !newStatus) {
      return NextResponse.json({ message: 'Ride ID and new status are required.' }, { status: 400 });
    }

    const rideIndex = mockRides.findIndex(ride => ride.id === rideId);

    if (rideIndex === -1) {
      return NextResponse.json({ message: 'Ride not found.' }, { status: 404 });
    }

    mockRides[rideIndex].status = newStatus;
    // Simulate some status transitions, e.g., if completed, maybe it goes to history
    // For now, just update status. Frontend will filter.

    console.log(`Ride ${rideId} status updated to ${newStatus}`);
    return NextResponse.json({ message: 'Ride status updated successfully.', ride: mockRides[rideIndex] });

  } catch (error) {
    console.error("Error updating ride status:", error);
    return NextResponse.json({ message: "Failed to update ride status", error: (error as Error).message }, { status: 500 });
  }
}
