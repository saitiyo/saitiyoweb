import ActiveContractsCard from "../components/DashboardCard";
import Image from 'next/image';
import activecontracts from '../assets/activecontracts.png';
import deadlines from '../assets/deadlines.png';
import budget from '../assets/budget.png';
import progress from '../assets/progress.png';

const Dashboardpage = () => {
  return (
    <div className="flex justify-between">
      <ActiveContractsCard
        title="Active Contracts"
        value={24}
        image={
          <Image
            src={activecontracts}
            width={64}
            height={64}
            className="w-16 h-16"
            alt=""
          />
        }
      />
      <ActiveContractsCard 
      title="Upcoming Deadlines" 
      value={10}
      image={
          <Image
            src={deadlines}
            width={64}
            height={64}
            className="w-16 h-16"
            alt=""
          />
        } 
      />
      <ActiveContractsCard 
      title="Budget Summary" 
      value='12 M'
      image={
          <Image
            src={budget}
            width={64}
            height={64}
            className="w-16 h-16"
            alt=""
          />
        }
       />
      <ActiveContractsCard 
      title="Progress status" 
      value='10/24'
      image={
          <Image
            src={progress}
            width={64}
            height={64}
            className="w-16 h-16"
            alt=""
          />
        } 
      />
    </div>
  )
}

export default Dashboardpage;
