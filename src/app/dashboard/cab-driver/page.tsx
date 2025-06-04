
"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import Script from 'next/script';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCar, faStar, faCalendarDays, faWallet, faHistory, faCog, faConciergeBell, faMicrophone,
  faSearch, faLocationArrow, faPlus, faMinus, faVolumeUp, faMapMarkerAlt, faFlagCheckered,
  faMoneyBillWave, faInfoCircle, faComment, faPhone, faTimes, faBell, faList, faHouse, faClockRotateLeft, faUser
} from '@fortawesome/free-solid-svg-icons';

import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
// import { useAuth } from '@/contexts/AuthContext'; // Uncomment when integrating auth

declare global {
  interface Window {
    mappls: any;
  }
}

const MAP_MY_INDIA_API_KEY = process.env.NEXT_PUBLIC_MAP_MY_INDIA_API_KEY || 'YOUR_MAP_MY_INDIA_API_KEY_HERE';

export default function CabDriverDashboardPage() {
  // const { user, logout } = useAuth(); // Uncomment when integrating auth
  const [isOnline, setIsOnline] = useState(false);
  const [driverName, setDriverName] = useState("John Driver"); // Mock, replace with user?.name
  const [driverAvatar, setDriverAvatar] = useState("https://randomuser.me/api/portraits/men/32.jpg"); // Mock, replace with user?.image

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const driverMarkerRef = useRef<any>(null);
  const [driverLocation, setDriverLocation] = useState({ lat: 20.5937, lng: 78.9629 });
  const [searchInput, setSearchInput] = useState('');

  // Simulate active trip and status change after 1 second
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsOnline(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Map Initialization
  useEffect(() => {
    if (MAP_MY_INDIA_API_KEY && MAP_MY_INDIA_API_KEY !== 'YOUR_MAP_MY_INDIA_API_KEY_HERE' && typeof window.mappls !== 'undefined' && mapContainerRef.current && !mapInstanceRef.current) {
      mapInstanceRef.current = new window.mappls.Map(mapContainerRef.current, {
        center: driverLocation,
        zoom: 12,
        // streetViewControl: false, mapTypeControl: false, fullscreenControl: false // MapMyIndia specific options if needed
      });
      mapInstanceRef.current.addListener('load', () => {
        if (mapInstanceRef.current && !driverMarkerRef.current) {
          driverMarkerRef.current = new window.mappls.Marker({
            map: mapInstanceRef.current,
            position: driverLocation,
            // icon_options for custom cab icon:
            // icon_options: {
            //   iconUrl: '/path/to/your/cab-icon.png', // Provide your cab icon
            //   iconHeight: 35,
            //   iconWidth: 35,
            // }
          });
        }
      });
    }
    return () => {
      if (mapInstanceRef.current && typeof mapInstanceRef.current.destroy === 'function') {
        mapInstanceRef.current.destroy();
        mapInstanceRef.current = null;
        driverMarkerRef.current = null;
      }
    };
  }, []); // Initial map load

  // Update driver marker position on map
  useEffect(() => {
    if (driverMarkerRef.current && mapInstanceRef.current) {
      driverMarkerRef.current.setLngLat(driverLocation);
      // mapInstanceRef.current.setCenter(driverLocation); // Optionally re-center map
    }
  }, [driverLocation]);

  const handleStatusToggle = (checked: boolean) => {
    setIsOnline(checked);
  };

  const handleEmergency = () => {
    if (typeof document !== 'undefined') {
      document.body.style.backgroundColor = '#ffcccc';
      setTimeout(() => {
        document.body.style.backgroundColor = '';
      }, 500);
    }
    alert('Emergency signal sent! Help is on the way.');
  };

  const handleLocate = () => {
    if (mapInstanceRef.current && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLoc = { lat: position.coords.latitude, lng: position.coords.longitude };
          setDriverLocation(newLoc);
          if (mapInstanceRef.current) {
            mapInstanceRef.current.setCenter(newLoc);
            mapInstanceRef.current.setZoom(15);
          }
        },
        () => {
          alert("Could not get your location.");
        }
      );
    }
  };
  const handleZoomIn = () => mapInstanceRef.current?.setZoom(mapInstanceRef.current.getZoom() + 1);
  const handleZoomOut = () => mapInstanceRef.current?.setZoom(mapInstanceRef.current.getZoom() - 1);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value);
  };

  // Placeholder for passenger panel data
  const currentTripData = {
    passengerName: "Jane Passenger",
    passengerAvatar: "https://randomuser.me/api/portraits/women/44.jpg",
    isVip: true,
    status: "In Transit",
    pickupAddress: "123 Main Street, Central District",
    destinationAddress: "456 Central Park, Downtown",
    paymentAmount: 1250.50, // Example amount in INR
    paymentStatus: "Paid",
    timer: "08:24"
  };


  return (
    <>
      <Script
        src={`https://apis.mapmyindia.com/advancedmaps/v1/${MAP_MY_INDIA_API_KEY}/map_sdk.js`}
        strategy="beforeInteractive"
      />
      <div className="flex flex-col h-screen max-w-[1600px] mx-auto bg-white shadow-lg overflow-hidden font-['Segoe_UI',_Tahoma,_Geneva,_Verdana,_sans-serif] text-[#333]">
        {/* Header */}
        <header className="bg-gradient-to-r from-[#1a2a6c] to-[#2a5298] text-white p-[15px_25px] flex justify-between items-center shadow-[0_2px_10px_rgba(0,0,0,0.2)] relative z-10">
          <div className="flex justify-between items-center w-full">
            <div className="flex items-center gap-[10px] text-2xl font-semibold">
              <FontAwesomeIcon icon={faCar} className="text-3xl" />
              <span>DriveNow Driver</span>
            </div>
            <div className="flex items-center gap-[10px] text-lg">
              <span>Driver Status: <span id="status-text">{isOnline ? 'Online' : 'Offline'}</span></span>
              <Switch
                checked={isOnline}
                onCheckedChange={handleStatusToggle}
                id="status-toggle"
                className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-300 w-[60px] h-[30px]"
              />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Profile Sidebar */}
          <aside className="w-[300px] bg-gradient-to-b from-[#2c3e50] to-[#1c2833] text-white p-[25px_20px] flex flex-col gap-[25px] shadow-[2px_0_10px_rgba(0,0,0,0.1)] z-[2] md:flex hidden">
            <Image src={driverAvatar} alt="Driver Profile" width={120} height={120} className="rounded-full object-cover border-2 border-[#3498db] mx-auto block" data-ai-hint="driver avatar"/>
            <h2 className="text-center text-3xl mt-[10px]">{driverName}</h2>
            <p className="text-center text-[#ecf0f1] opacity-90 text-lg">john.driver@example.com</p>
            
            <div className="flex justify-around bg-[rgba(44,62,80,0.7)] p-[15px_10px] rounded-[10px] mt-[10px]">
              <span className="flex flex-col items-center gap-[5px] text-lg"><FontAwesomeIcon icon={faStar} className="text-2xl text-[#3498db]" /> 4.92</span>
              <span className="flex flex-col items-center gap-[5px] text-lg"><FontAwesomeIcon icon={faCar} className="text-2xl text-[#3498db]" /> 1245 Trips</span>
              <span className="flex flex-col items-center gap-[5px] text-lg"><FontAwesomeIcon icon={faCalendarDays} className="text-2xl text-[#3498db]" /> 5 Years</span>
            </div>
            
            <div className={`p-[8px_15px] rounded-[20px] text-center font-bold text-lg my-[10px] ${isOnline ? 'bg-[#27ae60] text-white' : 'bg-[#34495e]'}`}>
              {isOnline ? 'On Work' : 'Offline'}
            </div>
            
            <nav className="flex flex-col gap-[12px] mt-[10px]">
              <Button variant="ghost" className="bg-[rgba(52,73,94,0.6)] text-white p-[14px_20px] rounded-[8px] text-left text-lg flex items-center gap-[12px] justify-start hover:bg-[rgba(41,128,185,0.8)] hover:translate-x-[5px] transition-all">
                <FontAwesomeIcon icon={faWallet} className="text-xl w-[25px]" /> My Wallet
              </Button>
              <Button variant="ghost" className="bg-[rgba(52,73,94,0.6)] text-white p-[14px_20px] rounded-[8px] text-left text-lg flex items-center gap-[12px] justify-start hover:bg-[rgba(41,128,185,0.8)] hover:translate-x-[5px] transition-all">
                <FontAwesomeIcon icon={faHistory} className="text-xl w-[25px]" /> History
              </Button>
              <Button variant="ghost" className="bg-[rgba(52,73,94,0.6)] text-white p-[14px_20px] rounded-[8px] text-left text-lg flex items-center gap-[12px] justify-start hover:bg-[rgba(41,128,185,0.8)] hover:translate-x-[5px] transition-all">
                <FontAwesomeIcon icon={faCog} className="text-xl w-[25px]" /> Car Preferences
              </Button>
               <Button variant="ghost" className="bg-[rgba(52,73,94,0.6)] text-white p-[14px_20px] rounded-[8px] text-left text-lg flex items-center gap-[12px] justify-start hover:bg-[rgba(41,128,185,0.8)] hover:translate-x-[5px] transition-all">
                <FontAwesomeIcon icon={faConciergeBell} className="text-xl w-[25px]" /> Services
              </Button>
            </nav>
            
            <Button className="bg-[#3498db] w-[60px] h-[60px] rounded-full flex items-center justify-center mt-[20px] mx-auto shadow-[0_4px_10px_rgba(0,0,0,0.2)] hover:bg-[#2980b9] hover:scale-110 transition-all">
              <FontAwesomeIcon icon={faMicrophone} className="text-3xl text-white" />
            </Button>
          </aside>

          {/* Map View */}
          <div className="flex-1 relative bg-[#2c3e50] overflow-hidden">
            <div ref={mapContainerRef} className="h-full w-full relative bg-gradient-to-br from-[#1a2980] to-[#26d0ce]">
              {(!MAP_MY_INDIA_API_KEY || MAP_MY_INDIA_API_KEY === 'YOUR_MAP_MY_INDIA_API_KEY_HERE') && <div className="h-full flex items-center justify-center text-destructive-foreground bg-destructive p-4">MapMyIndia API Key is not configured.</div>}
            </div>
            <div className="absolute top-[20px] left-[20px] right-[20px] flex justify-between z-[2]">
              <div className="bg-white rounded-[30px] p-[12px_20px] flex items-center gap-[10px] shadow-[0_4px_15px_rgba(0,0,0,0.2)] w-[400px]">
                <FontAwesomeIcon icon={faSearch} />
                <Input type="text" placeholder="Search destination..." className="border-none outline-none text-lg w-full focus-visible:ring-0 focus-visible:ring-offset-0" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
              </div>
              <div className="flex gap-[15px]">
                <Button onClick={handleLocate} size="icon" className="bg-white w-[50px] h-[50px] rounded-full flex items-center justify-center shadow-[0_4px_10px_rgba(0,0,0,0.2)] text-gray-700 hover:translate-y-[-3px] transition-all">
                  <FontAwesomeIcon icon={faLocationArrow} />
                </Button>
                <Button onClick={handleZoomIn} size="icon" className="bg-white w-[50px] h-[50px] rounded-full flex items-center justify-center shadow-[0_4px_10px_rgba(0,0,0,0.2)] text-gray-700 hover:translate-y-[-3px] transition-all">
                  <FontAwesomeIcon icon={faPlus} />
                </Button>
                <Button onClick={handleZoomOut} size="icon" className="bg-white w-[50px] h-[50px] rounded-full flex items-center justify-center shadow-[0_4px_10px_rgba(0,0,0,0.2)] text-gray-700 hover:translate-y-[-3px] transition-all">
                  <FontAwesomeIcon icon={faMinus} />
                </Button>
              </div>
            </div>
            
            {/* Placeholder for route-marker, actual marker is on map */}
            {/* <div className="route-marker absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-[#e74c3c] rounded-full flex items-center justify-center shadow-[0_0_0_10px_rgba(231,76,60,0.3)] animate-pulse">
              <FontAwesomeIcon icon={faCar} className="text-white text-2xl" />
            </div> */}
            
            <div className="absolute bottom-[30px] left-1/2 transform -translate-x-1/2 bg-white p-[15px_25px] rounded-[15px] shadow-[0_5px_20px_rgba(0,0,0,0.3)] flex flex-col items-center max-w-[500px] w-[90%] z-[2]">
              <span className="text-xl font-semibold mb-[8px] text-[#2c3e50] text-center flex items-center gap-2"><FontAwesomeIcon icon={faVolumeUp} /> 200 meters ahead turn right</span>
              <span className="text-lg text-[#7f8c8d] text-center">Martadinata Street, Deskakru</span>
            </div>
          </div>

          {/* Passenger Panel */}
          <section className="w-[350px] bg-white p-[25px] flex flex-col gap-[25px] shadow-[-2px_0_10px_rgba(0,0,0,0.1)] z-[2] md:flex hidden">
            <div className="flex justify-between items-center pb-[15px] border-b border-[#ecf0f1]">
              <div className="text-xl text-[#2c3e50] font-semibold">Current Trip</div>
              <div className="timer text-gray-600">{currentTripData.timer}</div>
            </div>
            
            <div className="bg-[#f8f9fa] rounded-[15px] p-[20px] shadow-[0_4px_10px_rgba(0,0,0,0.05)]">
              <div className="flex items-center gap-[15px] mb-[20px]">
                <Image src={currentTripData.passengerAvatar} alt="Passenger" width={70} height={70} className="rounded-full object-cover border-2 border-[#3498db]" data-ai-hint="person avatar"/>
                <div>
                  <div className="text-2xl font-semibold">
                    {currentTripData.passengerName}
                    {currentTripData.isVip && <span className="ml-[10px] bg-gradient-to-r from-yellow-400 to-orange-400 text-yellow-900 p-[3px_12px] rounded-[15px] text-sm font-bold">VIP</span>}
                  </div>
                  <div className="bg-[#e1f0fa] text-[#3498db] p-[5px_15px] rounded-[20px] text-sm font-semibold inline-block mt-[8px]">{currentTripData.status}</div>
                </div>
              </div>
              
              <div className="flex gap-[15px] mt-[20px] justify-center">
                <Button size="icon" className="bg-[#3498db] text-white w-[50px] h-[50px] rounded-full text-xl hover:scale-110 transition-all">
                  <FontAwesomeIcon icon={faComment} />
                </Button>
                <Button size="icon" className="bg-[#2ecc71] text-white w-[50px] h-[50px] rounded-full text-xl hover:scale-110 transition-all">
                  <FontAwesomeIcon icon={faPhone} />
                </Button>
                <Button size="icon" className="bg-[#e74c3c] text-white w-[50px] h-[50px] rounded-full text-xl hover:scale-110 transition-all">
                  <FontAwesomeIcon icon={faTimes} />
                </Button>
              </div>
            </div>
            
            <div className="bg-[#f8f9fa] rounded-[15px] p-[20px] shadow-[0_4px_10px_rgba(0,0,0,0.05)]">
              <div className="text-lg text-[#7f8c8d] mb-[10px] flex items-center gap-[8px]"><FontAwesomeIcon icon={faMapMarkerAlt} /> Pick up Point</div>
              <div className="text-lg font-medium text-[#2c3e50] pl-[30px]">{currentTripData.pickupAddress}</div>
              
              <div className="text-lg text-[#7f8c8d] mt-[15px] mb-[10px] flex items-center gap-[8px]"><FontAwesomeIcon icon={faFlagCheckered} /> Destination</div>
              <div className="text-lg font-medium text-[#2c3e50] pl-[30px]">{currentTripData.destinationAddress}</div>
            </div>
            
            <div className="bg-[#f8f9fa] rounded-[15px] p-[20px] shadow-[0_4px_10px_rgba(0,0,0,0.05)]">
              <div className="text-lg text-[#7f8c8d] mb-[10px] flex items-center gap-[8px]"><FontAwesomeIcon icon={faMoneyBillWave} /> Passenger Payment</div>
              <div className="text-3xl font-bold text-[#27ae60] mt-[5px]">{formatCurrency(currentTripData.paymentAmount)}</div>
              <div className="text-lg text-[#7f8c8d] mt-[8px] mb-[10px] flex items-center gap-[8px]"><FontAwesomeIcon icon={faInfoCircle} /> Status</div>
              <div className="text-lg font-medium text-[#2c3e50] pl-[30px]">{currentTripData.paymentStatus}</div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <footer className="bg-[#2c3e50] text-white p-[15px_25px] flex justify-between items-center shadow-[0_-2px_10px_rgba(0,0,0,0.1)]">
          <Button onClick={handleEmergency} className="bg-gradient-to-r from-[#e74c3c] to-[#c0392b] text-white p-[12px_25px] rounded-[30px] text-lg font-semibold flex items-center gap-[10px] shadow-[0_4px_15px_rgba(231,76,60,0.4)] hover:scale-105 hover:shadow-[0_6px_20px_rgba(231,76,60,0.6)] transition-all">
            <FontAwesomeIcon icon={faBell} /> EMERGENCY
          </Button>
          <div className="text-base opacity-80">© {new Date().getFullYear()} DriveNow. All rights reserved.</div>
        </footer>
      </div>
    </>
  );
}
