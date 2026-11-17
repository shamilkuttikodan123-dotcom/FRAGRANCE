

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchBanners } from "../../features/bannerSlice";
import Loading from "./Loading";
import "../../Style/HeroBanner.css";

function HeroBanner() {
    const dispatch = useDispatch();

    const { banners, loading, error } = useSelector(
        (state) => state.banner
    );

    useEffect(() => {
        dispatch(fetchBanners());
    }, [dispatch]);

    if (loading) {
        return <Loading/>
    }

    if (error) {
        return <p>{error}</p>;
    }

    return (
     <div className="hero-banner">
    {banners.map((banner) => (
        <div className="hero-banner-slide" key={banner.id}>
            <img
                src={banner.image_url}
                alt={banner.title}
            />
        </div>
    ))}
    </div>
    );
}

export default HeroBanner;


