const PostComments = require('./post_comments.model');
const PostLikes = require('./post_likes.model');
const Posts = require('./posts.model');
const Project = require('./project.model');
const ProjectComment = require('./project_comments.model');
const ProjectLike = require('./project_likes.model');
const ProjectPartner = require('./project_partner.model');
const User = require('./user.model');

const V0MODELS = [
  User,
  Project,
  ProjectComment,
  ProjectLike,
  ProjectPartner,
  Posts,
  PostLikes,
  PostComments,
];

exports.V0MODELS = V0MODELS;
