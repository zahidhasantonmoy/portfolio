import { motion } from 'framer-motion';
import GradientText from './GradientText';

const NewsletterSection = () => {
  return (
    <section className="py-20 bg-gradient-to-r from-blue-500 to-purple-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-4xl font-bold text-white mb-4">
            Stay Updated
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Subscribe to my newsletter for the latest updates and insights
          </p>
          
          <form className="max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
              <button
                type="submit"
                className="px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-white/90 transition-colors"
              >
                Subscribe
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </section>
  );
};

export default NewsletterSection; 