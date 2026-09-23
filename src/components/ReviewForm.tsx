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
        <section id="review" className="py-20 transition-colors duration-300" style={{ background: 'var(--bg-surface)' }}>
            <div className="container mx-auto px-6">
                <motion.h2
                    className="text-4xl font-bold text-center mb-12 gradient-text"
                    initial={{ opacity: 0, y: -50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7 }}
                    viewport={{ once: true }}
                >
                    Leave a Review
                </motion.h2>

                <motion.div
                    className="max-w-2xl mx-auto p-8 rounded-xl shadow-lg"
                    style={{ background: 'var(--bg-base)', border: '1px solid var(--border)' }}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    viewport={{ once: true }}
                >
                    {submitted ? (
                        <div className="text-center py-12">
                            <h3 className="text-2xl font-bold mb-4" style={{ color: 'var(--success)' }}>Thank You!</h3>
                            <p style={{ color: 'var(--text-secondary)' }}>Your feedback has been submitted successfully.</p>
                            <button
                                onClick={() => setSubmitted(false)}
                                className="mt-6 hover:underline"
                                style={{ color: 'var(--accent-primary)' }}
                            >
                                Submit another review
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block mb-2 font-medium" style={{ color: 'var(--text-secondary)' }}>Rating</label>
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
                                                    color={ratingValue <= (hover || rating) ? "#ffc107" : "var(--border)"}
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
                                <label htmlFor="name" className="block mb-2 font-medium" style={{ color: 'var(--text-secondary)' }}>Name</label>
                                <input
                                    type="text"
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 transition-colors"
                                    style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', color: 'var(--text-primary)', '--tw-ring-color': 'var(--accent-primary)' } as any}
                                    placeholder="Your Name"
                                />
                            </div>

                            <div>
                                <label htmlFor="comment" className="block mb-2 font-medium" style={{ color: 'var(--text-secondary)' }}>Comment</label>
                                <textarea
                                    id="comment"
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    required
                                    rows={4}
                                    className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 transition-colors"
                                    style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', color: 'var(--text-primary)', '--tw-ring-color': 'var(--accent-primary)' } as any}
                                    placeholder="Share your experience..."
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                className="btn-primary w-full py-4 rounded-lg text-base"
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
