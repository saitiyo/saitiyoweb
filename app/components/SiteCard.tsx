// Reusable Project Card Component
const SiteCard = ({site}:{site:Site}) =>{ 
  
  const color = site.status === 'IN_PROGRESS' ? "bg-green-500" : site.status === "CLOSED" ? "bg-red-500" : "bg-amber-400"
  
  return(
  <div className="relative bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-4">
    {/* Notification Badge */}
    {site.notificationCount && (
      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
        {site.notificationCount}
      </span>
    )}

    <div className="flex items-center gap-4">
      {/* Project Logo Placeholder */}
      <div className={`w-14 h-14 rounded-xl flex items-center justify-center border border-gray-100 overflow-hidden ${site.logoUrl === 'dark' ? 'bg-black' : 'bg-white'}`}>
         <div className="text-[10px] text-gray-400">LOGO</div>
      </div>
      
      <h3 className="text-lg font-semibold text-gray-700">{site.name}</h3>
    </div>

    <div className="space-y-1">
      <p className="text-[10px] text-gray-400 uppercase tracking-tight">Status : {site.status}</p>
      <p className="text-[10px] text-gray-400 uppercase tracking-tight">Days left: {site.daysLeft}</p>
      
      {/* Progress Bar */}
      <div className="w-full bg-gray-100 h-1 rounded-full mt-3 overflow-hidden">
        <div 
          className={`h-full ${color}`} 
          style={{ width: `${site.progress}%` }}
        />
      </div>
    </div>
  </div>
)}

export default SiteCard;
