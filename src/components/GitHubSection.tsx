"use client";

import { motion } from 'framer-motion';
import GradientText from './GradientText';
import { useState, useEffect } from 'react';

interface GitHubStats {
  totalContributions: number;
  repositories: number;
  stars: number;
  followers: number;
}

interface Repository {
  name: string;
  description: string;
  language: string;
  url: string;
  stars: number;
  forks: number;
}

const GitHubSection = () => {
  const [stats, setStats] = useState<GitHubStats>({
    totalContributions: 0,
    repositories: 8,
    stars: 0,
    followers: 0
  });

  const [repos, setRepos] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGitHubData = async () => {
      try {
        // Fetch user data
        const userResponse = await fetch('https://api.github.com/users/zahidhasantonmoy');
        const userData = await userResponse.json();

        // Fetch repositories
        const reposResponse = await fetch('https://api.github.com/users/zahidhasantonmoy/repos');
        const reposData = await reposResponse.json();

        setStats({
          ...stats,
          repositories: userData.public_repos,
          followers: userData.followers
        });

        const formattedRepos = reposData.map((repo: any) => ({
          name: repo.name,
          description: repo.description || 'No description available',
          language: repo.language || 'Other',
          url: repo.html_url,
          stars: repo.stargazers_count,
          forks: repo.forks_count
        }));

        setRepos(formattedRepos);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching GitHub data:', error);
        setLoading(false);
      }
    };

    fetchGitHubData();
  }, []);

  const getLanguageColor = (language: string) => {
    const colors: { [key: string]: string } = {
      'Java': 'bg-orange-500',
      'C++': 'bg-pink-500',
      'HTML': 'bg-red-500',
      'PHP': 'bg-purple-500',
      'JavaScript': 'bg-yellow-500',
      'TypeScript': 'bg-blue-500',
      'Other': 'bg-gray-500'
    };
    return colors[language] || colors['Other'];
  };

  if (loading) {
    return (
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-60 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-96 mx-auto"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <GradientText className="text-4xl font-bold mb-4">
            GitHub Projects
          </GradientText>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            My open source contributions and projects
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {[
            { label: 'Repositories', value: stats.repositories },
            { label: 'Followers', value: stats.followers },
            { label: 'Languages', value: Array.from(new Set(repos.map(repo => repo.language))).length },
            { label: 'Total Stars', value: repos.reduce((acc, repo) => acc + repo.stars, 0) }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow text-center"
            >
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {stat.value}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {repos.map((repo, index) => (
            <motion.a
              href={repo.url}
              target="_blank"
              rel="noopener noreferrer"
              key={repo.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                  {repo.name}
                </h3>
                <span className={`px-3 py-1 rounded-full text-white text-sm ${getLanguageColor(repo.language)}`}>
                  {repo.language}
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {repo.description}
              </p>
              <div className="flex items-center justify-between text-gray-500 dark:text-gray-400">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span>{repo.stars}</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  <span>{repo.forks}</span>
                </div>
              </div>
            </motion.a>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <a
            href="https://github.com/zahidhasantonmoy"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.137 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" clipRule="evenodd" />
            </svg>
            View GitHub Profile
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default GitHubSection; 