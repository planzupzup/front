"use client";
/* eslint-disable */
import { Location } from "@/app/plan/[planId]/page";
import style from "@/app/plan/[planId]/Plan.module.scss";
import { getTimeUnit } from "@/app/utils/getTimeUnit";
import LocationItem from "@/app/components/locationItem/LocationItem";
import { getOrderColor } from "@/app/utils/getOrderColor";

type TProps = {
    isTotal?: boolean;
    locationList: Location[];
    setLocation: React.Dispatch<React.SetStateAction<Location | undefined>>;
    orderColor: string;
}

const LocationList = ({ isTotal , locationList, setLocation, orderColor }:TProps) => {

    return (
        isTotal ? <div className={style.total_location_list}>
        {locationList.map((location, idx) => (
        <LocationItem isTotal={true} locationIndex={idx+1} location={location} setLocation={setLocation} orderColor={orderColor}/>
        ))}
    </div> : <div className={style.location_list}>
    {locationList.map((location, idx) => (
        <div className={style.duration_wrap}>
             {idx>0 && <div className={style.duration}>{getTimeUnit(location.duration)}</div>}
            <LocationItem isTotal={false} locationIndex={idx+1} location={location} setLocation={setLocation} orderColor={orderColor}/>
        </div>
        ))}
        <span className={style.line} />
    </div>
    )
}

export default LocationList;