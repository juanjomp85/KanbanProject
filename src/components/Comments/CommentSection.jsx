import React, { useState } from 'react';
import { useTaskContext } from '../../context/TaskContext';
import { format } from 'date-fns';
import { Clock } from 'lucide-react';

const CommentSection = ({ task }) => {
  const { addComment } = useTaskContext();
  const [newComment, setNewComment] = useState('');

  const handleAddComment = () => {
    if (newComment.trim()) {
      addComment(task.id, newComment);
      setNewComment('');
    }
  };

  return (
    <div className="comment-section">
      <h3 className="comment-title">Comentarios</h3>
      
      <div className="comment-input-row">
        <div className="comment-avatar avatar-primary">
          U
        </div>
        <div className="comment-input-area">
          <textarea
            className="input-field"
            placeholder="Escribe un comentario..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <div className="comment-actions">
            <button className="btn btn-primary" onClick={handleAddComment}>
              Comentar
            </button>
          </div>
        </div>
      </div>

      <div className="comment-list">
        {[...(task.comments || [])].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).map((comment) => (
          <div key={comment.id} className="comment-item">
            <div className="comment-avatar avatar-secondary">
              {comment.author.charAt(0)}
            </div>
            <div className="comment-box">
              <div className="comment-box-header">
                <span className="comment-author">{comment.author}</span>
                <span className="comment-time">
                  <Clock size={12} />
                  {format(new Date(comment.timestamp), 'MMM d, yyyy HH:mm')}
                </span>
              </div>
              <p className="comment-text">{comment.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommentSection;
