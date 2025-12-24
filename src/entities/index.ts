import { Entity, PrimaryColumn, Column, CreateDateColumn, OneToMany, ManyToOne, BeforeInsert } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

// 1. User
@Entity()
export class User {
  @PrimaryColumn() id: string;
  @BeforeInsert() generateId() { if (!this.id) this.id = uuidv4(); }
  @Column({ unique: true }) username: string;
  @Column() password: string;
  @Column({ default: 'USER' }) role: string;
}

// 2. Video (CẬP NHẬT Ở ĐÂY)
@Entity()
export class Video {
  @PrimaryColumn() id: string;
  @BeforeInsert() generateId() { if (!this.id) this.id = uuidv4(); }

  @Column() title: string;
  @Column({ default: 'PENDING' }) status: string;
  @Column({ nullable: true }) streamingUrl: string;
  
  @Column({ default: 0 }) views: number;
  @Column({ nullable: true }) uploader: string;
  
  // --- MỚI THÊM: Lưu độ dài video (dạng 05:30) ---
  @Column({ default: '00:00' }) duration: string;
  // ----------------------------------------------

  @CreateDateColumn() createdAt: Date;

  @OneToMany(() => Comment, (comment) => comment.video, { cascade: true })
  comments: Comment[];

  @OneToMany(() => Like, (like) => like.video, { cascade: true })
  likes: Like[];
}

// 3. Comment
@Entity()
export class Comment {
  @PrimaryColumn() id: string;
  @BeforeInsert() generateId() { if (!this.id) this.id = uuidv4(); }
  @Column() content: string;
  @Column() username: string;
  @CreateDateColumn() createdAt: Date;
  @ManyToOne(() => Video, v => v.comments, { onDelete: 'CASCADE' }) video: Video;
}

// 4. Like
@Entity()
export class Like {
  @PrimaryColumn() id: string;
  @BeforeInsert() generateId() { if (!this.id) this.id = uuidv4(); }
  @Column() username: string;
  @Column() isLike: boolean;
  @ManyToOne(() => Video, v => v.likes, { onDelete: 'CASCADE' }) video: Video;
}

// 5. Playlist (NEW)
@Entity()
export class Playlist {
  @PrimaryColumn() id: string;
  @BeforeInsert() generateId() { if (!this.id) this.id = uuidv4(); }

  @Column() name: string;
  @Column() username: string; // Owner of playlist
  @Column('text', { array: true, default: () => "'{}'" }) videoIds: string[]; // Array of video IDs
  
  @CreateDateColumn() createdAt: Date;
}