// TODO: REPLACE THIS LANDING PAGE WITH AN ELEGANT, THEMATIC, AND WELL-DESIGNED LANDING PAGE RELEVANT TO THE PROJECT
import { motion } from "framer-motion";
import { Loader } from "lucide-react";

export default function Landing() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex flex-col"
    >

      
      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="max-w-5xl mx-auto relative px-4">
        {/* TODO: landing page goes here; replace with the landing page */}
        <div className="flex justify-center">
          <img
            src="./logo.svg"
            alt="Lock Icon"
            width={64}
            height={64}
            className="rounded-lg mb-8 mt-24"
          />
        </div>
        <div className="flex items-center justify-center">
          <Loader className="h-8 w-8 animate-spin mr-4" />
          <a
            href="https://vly.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline hover:text-primary/80 transition-colors"
          >
            vly.ai
          </a>&nbsp; is generating your project...
        </div>
        </div>
      </div>
    </motion.div>
  );
}
