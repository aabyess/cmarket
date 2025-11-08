import { useState, useEffect } from "react";

export function TimeDisplay() {
  const [kstTime, setKstTime] = useState("");
  const [eetTime, setEetTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      
      const kst = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Seoul',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }).format(now);
      
      const wib = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Jakarta',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }).format(now);
      
      setKstTime(`${kst} KST`);
      setEetTime(`${wib} WIB`);
    };
    
    updateTime();
    const interval = setInterval(updateTime, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="hidden lg:flex items-center space-x-4 text-sm text-muted-foreground">
      <div className="flex items-center">
        <div className="flag-korea w-4 h-3 rounded-sm mr-1"></div>
        <span data-testid="kst-time">{kstTime}</span>
      </div>
      <div className="flex items-center">
        <div className="flag-indonesia w-4 h-3 rounded-sm mr-1"></div>
        <span data-testid="wib-time">{eetTime}</span>
      </div>
    </div>
  );
}
