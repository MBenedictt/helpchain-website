'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import Image from 'next/image';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

export default function StepSwiper({ images }: { images: string[] }) {
    return (
        <div className="relative w-full max-w-4xl mx-auto">
            <Swiper
                modules={[Pagination, Navigation]}
                pagination={{ clickable: true }}
                navigation
                spaceBetween={20}
                slidesPerView={1}
                className="overflow-hidden mt-5"
            >
                {images.map((img, i) => (
                    <SwiperSlide key={i} className="border border-gray-200">
                        <div className="relative w-full h-[400px] max-md:h-[250px] max-sm:h-[180px]">
                            <Image
                                src={img}
                                alt={`tutorial image ${i + 1}`}
                                fill
                                className="object-cover"
                                loading="lazy"
                                sizes="(max-width: 768px) 100vw, 800px"
                                unoptimized={false}
                            />
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>

            <style jsx global>{`
                .swiper {
                    padding-bottom: 32px; /* space for pagination */
                }

                .swiper-pagination {
                    bottom: 0 !important;
                }

                .swiper-button-prev,
                .swiper-button-next {
                    color: #bef264; /* lime-600 */
                    transition: opacity 0.2s;
                    height: 32px;
                    width: 32px;
                    top: calc(50% - 20px);
                }

                .swiper-button-prev:hover,
                .swiper-button-next:hover {
                    opacity: 0.8;
                }

                .swiper-pagination-bullet {
                background-color: #bef264 !important; /* lime-300 */
                    opacity: 0.7;
                }

                .swiper-pagination-bullet-active {
                background-color: #65a30d !important; /* lime-600 */
                    opacity: 1;
                }
            `}</style>
        </div>
    );
}
