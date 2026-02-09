"use client";

import React from "react";
import CustomImage from "@/components/common/CustomImage";
import { Section } from "../../../types/sections";
import { getFileUrl } from "@/lib/utils";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";

const GallerySection = ({ section }: { section: Section }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleImageClick = (image: string) => {
    setSelectedImage(image);
    setIsDialogOpen(true);
  };

  return (
    <section className="py-12 px-4 md:px-6 lg:px-8">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-center mb-8">{section.config.title}</h2>
        <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">{section.config.description}</p>

        <Carousel className="w-full mx-auto">
          <CarouselContent>
            {section.config.images.map((image: any) => (
              <CarouselItem key={image.url} className="md:basis-1/2 lg:basis-1/3">
                <div className="p-1">
                  <Card
                    className="overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg"
                    onClick={() => handleImageClick(image.url)}
                  >
                    <CardContent className="p-0">
                      <div className="relative aspect-[4/3] w-full">
                        <CustomImage src={getFileUrl(image.url)} alt="image" fill />
                      </div>
                      {/* <div className="p-4">
                      <h3 className="font-medium">{image.title}</h3>
                    </div> */}
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="flex justify-center mt-4">
            <CarouselPrevious className="relative mr-2" />
            <CarouselNext className="relative ml-2" />
          </div>
        </Carousel>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          {selectedImage && (
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>{selectedImage}</DialogTitle>
                <DialogDescription>{selectedImage}</DialogDescription>
              </DialogHeader>
              <div className="relative aspect-video w-full overflow-hidden rounded-lg">
                <CustomImage src={getFileUrl(selectedImage) || "/placeholder.svg"} alt={selectedImage} fill className="object-cover" />
              </div>
            </DialogContent>
          )}
        </Dialog>
      </div>
    </section>
  );
};

export default GallerySection;
