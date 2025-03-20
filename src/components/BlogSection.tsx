import { motion } from 'framer-motion';
import GradientText from './GradientText';

interface BlogPost {
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  image: string;
  category: string;
}

const blogPosts: BlogPost[] = [
  {
    title: "Getting Started with Next.js",
    excerpt: "Learn the basics of Next.js and how to create your first application.",
    date: "March 20, 2024",
    readTime: "5 min read",
    image: "/blog/nextjs.jpg",
    category: "Web Development"
  },
  {
    title: "The Power of TypeScript",
    excerpt: "Discover why TypeScript is becoming the standard for modern web development.",
    date: "March 18, 2024",
    readTime: "7 min read",
    image: "/blog/typescript.jpg",
    category: "Programming"
  },
  {
    title: "Building Responsive UIs",
    excerpt: "Best practices for creating beautiful and responsive user interfaces.",
    date: "March 15, 2024",
    readTime: "6 min read",
    image: "/blog/responsive.jpg",
    category: "UI/UX"
  }
];

const BlogSection = () => {
  return (
    <section id="blog" className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <GradientText className="text-4xl font-bold mb-4">
            Latest Blog Posts
          </GradientText>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Thoughts and insights on web development
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post, index) => (
            <motion.article
              key={post.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="relative h-48">
                <img
                  src={post.image}
                  alt={post.title}
                  className="object-cover w-full h-full"
                />
                <div className="absolute top-4 right-4">
                  <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm">
                    {post.category}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-2">
                  <span>{post.date}</span>
                  <span>•</span>
                  <span>{post.readTime}</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  {post.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {post.excerpt}
                </p>
                <button className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 font-medium">
                  Read more →
                </button>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BlogSection; 