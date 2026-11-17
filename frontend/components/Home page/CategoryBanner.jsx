import React, { useEffect } from "react";
import "../../Style/CategoryBanner.css";
import { fetchCategoryBanners } from "../../features/bannerSlice";
import { useSelector,useDispatch } from "react-redux";
import Loading from "./Loading";
function CategoryBanner() {

     const dispatch = useDispatch();
    
        const { categoryBanner, loading, error } = useSelector(
            (state) => state.banner
        );
    
        useEffect(() => {
            dispatch(fetchCategoryBanners());
        }, [dispatch]);
    
        if (loading) {
            return <Loading/>
        }
    
        if (error) {
            return <p>{error}</p>;
        }


    return (
    <div>
    <section className="curated-collections">
        <div className="container">

        <div className="section-header">
            <span className="subtitle">
                THE OLFACTIVE SPECTRUM
            </span>

            <h2>Curated Collections</h2>

          
        </div>

        <div className="collections-grid">
        {categoryBanner.map((banner) => (
            <div className="collection-card" key={banner.id}>
                <div className="card-image">
                    <img
                        src={banner.image_url}
                        alt={banner.title}
                    />
                </div>

                <div className="card-content">
                   

                    <h3>{banner.title}</h3>

                    {banner.link_url && (
                        <a href={banner.link_url} className="banner-link">
                            Explore Collection →
                        </a>
                    )}
                </div>
            </div>
        ))}
        </div>

        </div>
    </section>
        </div>
       
    );
}

export default CategoryBanner;