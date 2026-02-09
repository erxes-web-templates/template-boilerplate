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
    <section className="relative py-20 px-4 md:px-6 lg:px-8 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5 pointer-events-none" />
      <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />
      
      <div className="container mx-auto relative z-10">
        <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
            {section.config.title}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {section.config.description}
          </p>
        </div>

        <Carousel className="w-full mx-auto animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-200">
          <CarouselContent>
            {section.config.images.map((image: any, index: number) => (
              <CarouselItem 
                key={image.url} 
                className="md:basis-1/2 lg:basis-1/3"
                style={{
                  animationDelay: `${index * 100}ms`
                }}
              >
                <div className="p-1">
                  <Card
                    className="group overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-2 border border-border/50 backdrop-blur-sm bg-card/50"
                    onClick={() => handleImageClick(image.url)}
                  >
                    <CardContent className="p-0 relative">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />
                      <div className="relative aspect-[4/3] w-full overflow-hidden">
                        <CustomImage 
                          src={getFileUrl(image.url)} 
                          alt="image" 
                          fill 
                          className="transition-transform duration-500 group-hover:scale-110"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="flex justify-center mt-8 gap-3">
            <CarouselPrevious className="relative static translate-y-0 hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:scale-110 shadow-lg" />
            <CarouselNext className="relative static translate-y-0 hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:scale-110 shadow-lg" />
          </div>
        </Carousel>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          {selectedImage && (
            <DialogContent className="max-w-4xl border-border/50 bg-background/95 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-300">
              <DialogHeader>
                <DialogTitle className="text-2xl bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  {selectedImage}
                </DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  {selectedImage}
                </DialogDescription>
              </DialogHeader>
              <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-border/50 shadow-2xl">
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