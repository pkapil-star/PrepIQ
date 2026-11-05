// Curated study links shown under each roadmap topic. Every URL here was checked to load.
// type: 'video' | 'article' | 'course' | 'practice' | 'book' | 'tool'
// paid: true marks a paid course; leave it off for free material.
// Keys of TOPIC_RESOURCES must match topic names in data-pipeline/seed/baseline.json exactly.

const link = (title, url, type, paid = false) => ({ title, url, type, paid })

const SUBJECT_RESOURCES = {
  DSA: [
    link("NeetCode Roadmap: patterns with video solutions", 'https://neetcode.io/roadmap', 'practice'),
    link("Striver's A2Z DSA Course", 'https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2/', 'course'),
    link('Algorithms Specialization (Stanford, Coursera)', 'https://www.coursera.org/specializations/algorithms', 'course', true),
    link('Grokking the Coding Interview (Educative)', 'https://www.educative.io/courses/grokking-coding-interview', 'course', true),
  ],
  OS: [
    link('Operating Systems: Three Easy Pieces (free book)', 'https://pages.cs.wisc.edu/~remzi/OSTEP/', 'book'),
    link('Neso Academy: Operating System lectures', 'https://www.nesoacademy.org/cs/03-operating-system', 'video'),
  ],
  DBMS: [
    link('SQLBolt: interactive SQL lessons', 'https://sqlbolt.com', 'practice'),
    link('CMU 15-445: Database Systems (lectures)', 'https://15445.courses.cs.cmu.edu/', 'course'),
    link('W3Schools SQL tutorial', 'https://www.w3schools.com/sql/', 'article'),
  ],
  CN: [
    link('Kurose & Ross: Computer Networking lectures', 'https://gaia.cs.umass.edu/kurose_ross/lectures.php', 'course'),
    link('Neso Academy: Computer Networks lectures', 'https://www.nesoacademy.org/cs/04-computer-networks', 'video'),
  ],
  OOP: [
    link('Refactoring Guru: design patterns & principles', 'https://refactoring.guru/design-patterns', 'article'),
  ],
}

const visualgo = (title, page) => link(`VisuAlgo: ${title}`, `https://visualgo.net/en/${page}`, 'tool')

const TOPIC_RESOURCES = {
  'Time & Space Complexity': [link('Big-O Cheat Sheet', 'https://www.bigocheatsheet.com', 'tool')],
  'Hashing (HashMap / HashSet)': [visualgo('hash tables', 'hashtable')],
  'Sorting & Binary Search': [visualgo('sorting', 'sorting')],
  Recursion: [visualgo('recursion', 'recursion')],
  'Linked Lists': [visualgo('linked lists', 'list')],
  'Trees & BST': [visualgo('binary search trees', 'bst')],
  'Heaps / Priority Queue': [visualgo('heaps', 'heap')],
  'Graphs: BFS / DFS': [visualgo('BFS and DFS', 'dfsbfs')],
  'Bit Manipulation': [visualgo('bitmasks', 'bitmask')],
  'Advanced Graphs (Shortest Path, Topo Sort, MST, Union-Find)': [
    visualgo('shortest paths', 'sssp'),
    visualgo('minimum spanning tree', 'mst'),
    visualgo('union-find', 'ufds'),
  ],
  'Segment Tree / Fenwick Tree': [visualgo('segment tree', 'segmenttree'), visualgo('Fenwick tree', 'fenwicktree')],

  'Processes & Threads': [
    link('OSTEP: the process abstraction', 'https://pages.cs.wisc.edu/~remzi/OSTEP/cpu-intro.pdf', 'book'),
    link('OSTEP: threads', 'https://pages.cs.wisc.edu/~remzi/OSTEP/threads-intro.pdf', 'book'),
  ],
  'CPU Scheduling': [link('OSTEP: scheduling', 'https://pages.cs.wisc.edu/~remzi/OSTEP/cpu-sched.pdf', 'book')],
  'Synchronization & Deadlocks': [link('OSTEP: concurrency bugs and deadlock', 'https://pages.cs.wisc.edu/~remzi/OSTEP/threads-bugs.pdf', 'book')],
  'Memory Management & Paging': [link('OSTEP: paging', 'https://pages.cs.wisc.edu/~remzi/OSTEP/vm-paging.pdf', 'book')],

  'SQL Queries & Joins': [
    link('SQLBolt: joins', 'https://sqlbolt.com/lesson/select_queries_with_joins', 'practice'),
    link('Mode SQL tutorial', 'https://mode.com/sql-tutorial/', 'article'),
  ],
  Normalization: [link('Database normalization (Wikipedia)', 'https://en.wikipedia.org/wiki/Database_normalization', 'article')],
  Indexing: [link('Use The Index, Luke: SQL indexing guide', 'https://use-the-index-luke.com', 'article')],
  'Transactions & ACID': [link('ACID (Wikipedia)', 'https://en.wikipedia.org/wiki/ACID', 'article')],

  'OSI & TCP/IP Model': [
    link('OSI model (Wikipedia)', 'https://en.wikipedia.org/wiki/OSI_model', 'article'),
    link('Internet protocol suite (Wikipedia)', 'https://en.wikipedia.org/wiki/Internet_protocol_suite', 'article'),
  ],
  'TCP vs UDP': [
    link('TCP (MDN)', 'https://developer.mozilla.org/en-US/docs/Glossary/TCP', 'article'),
    link('UDP (MDN)', 'https://developer.mozilla.org/en-US/docs/Glossary/UDP', 'article'),
  ],
  'HTTP, HTTPS & DNS': [
    link('An overview of HTTP (MDN)', 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Overview', 'article'),
    link('HTTPS (MDN)', 'https://developer.mozilla.org/en-US/docs/Glossary/HTTPS', 'article'),
    link('DNS (MDN)', 'https://developer.mozilla.org/en-US/docs/Glossary/DNS', 'article'),
  ],
  'IP Addressing & Subnetting': [link('Subnetting Mastery (Practical Networking)', 'https://www.practicalnetworking.net/stand-alone/subnetting-mastery/', 'article')],

  'SOLID Principles': [link('SOLID: the first five principles (DigitalOcean)', 'https://www.digitalocean.com/community/conceptual-articles/s-o-l-i-d-the-first-five-principles-of-object-oriented-design', 'article')],
  'Design Patterns': [link('Design pattern catalog (Refactoring Guru)', 'https://refactoring.guru/design-patterns/catalog', 'article')],
}

const MAX_FREE = 3

// Topic-specific links first, then the subject's free ones, capped; one paid course is always
// added last so it never crowds out the free material.
export function resourcesFor(topic) {
  const subject = SUBJECT_RESOURCES[topic.subject] ?? []
  const specific = TOPIC_RESOURCES[topic.name] ?? []
  const free = [...specific, ...subject.filter((r) => !r.paid)].slice(0, MAX_FREE)
  const paid = subject.find((r) => r.paid)
  return paid ? [...free, paid] : free
}
