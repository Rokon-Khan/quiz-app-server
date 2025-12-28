// Searchable fields for each model
export const userSearchableFields = ['full_name', 'email'];
export const categorySearchableFields = ['name', 'description'];
export const quizSearchableFields = ['title', 'description'];
export const questionSearchableFields = ['question_text'];
export const certificateSearchableFields = [];
export const funFactSearchableFields = ['title', 'content'];

// Filterable fields for each model
export const userFilterableFields = ['role', 'is_active', 'searchTerm'];
export const categoryFilterableFields = ['is_active', 'searchTerm'];
export const quizFilterableFields = ['category_id', 'difficulty_level', 'is_published', 'searchTerm'];
export const questionFilterableFields = ['quiz_id', 'question_type', 'searchTerm'];
export const certificateFilterableFields = ['user_id', 'quiz_id', 'searchTerm'];
export const funFactFilterableFields = ['question_id', 'searchTerm'];