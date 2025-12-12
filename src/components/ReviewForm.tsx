"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaStar } from 'react-icons/fa';

const ReviewForm = () => {
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [name, setName] = useState('');
    const [comment, setComment] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Simulate submission
        setTimeout(() => {
            setSubmitted(true);
            setRating(0);
            setName('');
            setComment('');
        }, 1000);
    };

    return (
        <section id="review" className="py-20 bg-gray-50 dark:bg-gray-800 transition-colors duration-300">
            <div className="container mx-auto px-6">
                <motion.h2
                    className="text-4xl font-bold text-center mb-12 text-gray-800 dark:text-white"
                    initial={{ opacity: 0, y: -50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7 }}
                    viewport={{ once: true }}
                >
                    Leave a Review
                </motion.h2>

                <motion.div
                    className="max-w-2xl mx-auto bg-white dark:bg-gray-700 p-8 rounded-xl shadow-lg"
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    viewport={{ once: true }}
                >
                    {submitted ? (
                        <div className="text-center py-12">
                            <h3 className="text-2xl font-bold text-green-500 mb-4">Thank You!</h3>
                            <p className="text-gray-600 dark:text-gray-300">Your feedback has been submitted successfully.</p>
                            <button
                                onClick={() => setSubmitted(false)}
                                className="mt-6 text-blue-500 hover:underline"
                            >
                                Submit another review
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-gray-700 dark:text-gray-200 mb-2 font-medium">Rating</label>
                                <div className="flex gap-2">
                                    {[...Array(5)].map((_, index) => {
                                        const ratingValue = index + 1;
                                        return (
                                            <label key={index}>
                                                <input
                                                    type="radio"
                                                    name="rating"
                                                    value={ratingValue}
                                                    onClick={() => setRating(ratingValue)}
                                                    className="hidden"
                                                />
                                                <FaStar
                                                    className="cursor-pointer transition-colors duration-200"
                                                    color={ratingValue <= (hover || rating) ? "#ffc107" : "#e4e5e9"}
                                                    size={30}
                                                    onMouseEnter={() => setHover(ratingValue)}
                                                    onMouseLeave={() => setHover(0)}
                                                />
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>

                            <div>
                                <label htmlFor="name" className="block text-gray-700 dark:text-gray-200 mb-2 font-medium">Name</label>
                                <input
                                    type="text"
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-600 border border-gray-200 dark:border-gray-500 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                                    placeholder="Your Name"
                                />
                            </div>

                            <div>
                                <label htmlFor="comment" className="block text-gray-700 dark:text-gray-200 mb-2 font-medium">Comment</label>
                                <textarea
                                    id="comment"
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    required
                                    rows={4}
                                    className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-600 border border-gray-200 dark:border-gray-500 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                                    placeholder="Share your experience..."
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors duration-300 shadow-md"
                            >
                                Submit Review
                            </button>
                        </form>
                    )}
                </motion.div>
            </div>
        </section>
    );
};

export default ReviewForm;
