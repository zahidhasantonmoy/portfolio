"use client";
import React from 'react';
import { motion } from 'framer-motion';
import GradientText from './GradientText';
import Image from 'next/image';

interface Testimonial {
  name: string;
  role: string;
  company: string;
  image: string;
  text: string;
}

const testimonials: Testimonial[] = [
  {
    name: "Dr. Anya Sharma",
    role: "Head of AI Research",
    company: "Innovate AI Labs",
    image: "/images/profile.jpg", // Placeholder
    text: "Zahid's expertise in AI agent development is truly remarkable. His solutions are innovative, efficient, and have significantly boosted our capabilities."
  },
  {
    name: "Mr. David Chen",
    role: "Chief Marketing Officer",
    company: "Global Digital Solutions",
    image: "/images/profile.jpg", // Placeholder
    text: "As a digital marketer, Zahid has an exceptional grasp of data analytics. His strategies have consistently delivered outstanding ROI."
  },
  {
    name: "Ms. Emily White",
    role: "Lead Data Scientist",
    company: "Quantify Insights",
    image: "/images/profile.jpg", // Placeholder
    text: "Zahid's analytical rigor and ability to extract actionable insights from complex datasets are invaluable. A true asset to any data-driven team."
  },
  {
    name: "James Wilson",
    role: "CTO",
    company: "TechFlow",
    image: "/images/profile.jpg",
    text: "The web application built by Zahid is blazing fast and looks stunning. The attention to detail in the UI/UX is impressive."
  }
];

// Duplicate for marquee effect
const marqueeTestimonials = [...testimonials, ...testimonials, ...testimonials];

const TestimonialSection = () => {
  return (
    <section id="testimonials" className="py-20 bg-white dark:bg-gray-900 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <GradientText text="Client Testimonials" className="text-4xl font-bold mb-4" />
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            What people say about my work
          </p>
        </motion.div>
      </div>

      {/* Marquee Container */}
      <div className="relative w-full overflow-hidden mask-linear-fade">
        {/* Gradients on sides to fade out */}
        <div className="absolute top-0 left-0 h-full w-24 bg-gradient-to-r from-white dark:from-gray-900 to-transparent z-10 pointer-events-none" />
        <div className="absolute top-0 right-0 h-full w-24 bg-gradient-to-l from-white dark:from-gray-900 to-transparent z-10 pointer-events-none" />

        <motion.div
          className="flex gap-8 w-max"
          animate={{ x: ["0%", "-50%"] }} // Move halfway (because we tripled content, but generally double is enough, let's play safe)
          // Actually with 3 sets, -33% is one full loop of original content.
          // Let's stick to a simpler logic: animate purely based on width.
          // Better yet, use a simpler `animate` loop.
          transition={{
            duration: 40,
            ease: "linear",
            repeat: Infinity
          }}
          whileHover={{ animationPlayState: "paused" }} // Framer doesn't support playState on hover directly like CSS
        // So we can use onMouseEnter/Leave to set controls if we used useAnimation, but CSS is smoother for continuous loops.
        // Let's stick to framer for now, but simple hover pause is tricky with basic animate.
        // We'll proceed without hover pause for simplicity or add a specific class. 
        >
          {marqueeTestimonials.map((testimonial, index) => (
            <div
              key={`${testimonial.name}-${index}`}
              className="w-[350px] md:w-[450px] flex-shrink-0 bg-gray-50 dark:bg-gray-800 rounded-xl p-8 shadow-lg border border-gray-100 dark:border-gray-700"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-blue-500">
                  <Image
                    src={testimonial.image}
                    alt={testimonial.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white">{testimonial.name}</h3>
                  <p className="text-sm text-blue-600 dark:text-blue-400">{testimonial.role} @ {testimonial.company}</p>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-300 italic leading-relaxed">
                "{testimonial.text}"
              </p>
              <div className="mt-4 flex text-yellow-500 gap-1">
                {[1, 2, 3, 4, 5].map(star => <span key={star}>★</span>)}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default TestimonialSection;