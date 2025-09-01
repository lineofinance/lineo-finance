const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

module.exports = function() {
  const content = {
    faqs: {},
    knowledgeBase: []
  };
  
  // Process FAQs
  const faqsDir = path.join(__dirname, '../content/faqs');
  if (fs.existsSync(faqsDir)) {
    const faqFiles = fs.readdirSync(faqsDir).filter(file => file.endsWith('.md'));
    
    faqFiles.forEach(file => {
      const filePath = path.join(faqsDir, file);
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const { data, content: markdownContent } = matter(fileContent);
      
      // Parse the content into FAQ items
      const items = [];
      const sections = markdownContent.split(/^##\s+/m).filter(Boolean);
      
      sections.forEach(section => {
        const lines = section.trim().split('\n');
        const question = lines[0].trim();
        const answer = lines.slice(1).join('\n').trim();
        
        if (question && answer) {
          items.push({ question, answer });
        }
      });
      
      // Store FAQs by filename (without .md extension)
      const key = path.basename(file, '.md');
      content.faqs[key] = {
        title: data.title || 'Häufig gestellte Fragen',
        items: items
      };
    });
  }
  
  // Process Knowledge Base articles
  const kbDir = path.join(__dirname, '../content/knowledge-base');
  if (fs.existsSync(kbDir)) {
    const kbFiles = fs.readdirSync(kbDir).filter(file => file.endsWith('.md'));
    
    kbFiles.forEach(file => {
      const filePath = path.join(kbDir, file);
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const { data } = matter(fileContent);
      
      content.knowledgeBase.push({
        title: data.title,
        description: data.description,
        date: data.date,
        slug: path.basename(file, '.md'),
        tags: data.tags || []
      });
    });
    
    // Sort knowledge base articles by date (newest first)
    content.knowledgeBase.sort((a, b) => {
      const dateA = new Date(a.date || 0);
      const dateB = new Date(b.date || 0);
      return dateB - dateA;
    });
  }
  
  return content;
};