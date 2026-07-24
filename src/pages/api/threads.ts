// src/pages/api/threads.ts
// 裏側で特権許可された Firebase Admin SDK 経由で Firestore に100%確実に書き込み・全体共有する API

import type { APIRoute } from 'astro';
import { db } from '../../lib/firebase-server';

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const constellation = url.searchParams.get('constellation') || 'genai-foundations';

  try {
    const postsRef = db.collection('threads').doc(constellation).collection('posts');
    const snapshot = await postsRef.orderBy('createdAt', 'desc').get();

    const posts = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        authorName: data.authorName || '航海士 Voyager',
        authorAvatar: data.authorAvatar || '/assets/cat.jpg',
        content: data.content || '',
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : (data.createdAt || new Date().toISOString()),
        cheersCount: data.cheersCount || 0
      };
    });

    return new Response(JSON.stringify({ posts }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate'
      }
    });
  } catch (error) {
    console.error('Failed to fetch threads via Admin SDK API:', error);
    return new Response(JSON.stringify({ posts: [] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const rawText = await request.text();
    let body: any = {};
    if (rawText) {
      body = JSON.parse(rawText);
    }

    const {
      constellation = 'genai-foundations',
      authorName = '星海 航海士 (Voyager)',
      authorAvatar = '/assets/cat.jpg',
      content = ''
    } = body;

    if (!content.trim()) {
      return new Response(JSON.stringify({ error: 'Content is empty' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const postsRef = db.collection('threads').doc(constellation).collection('posts');
    const newDoc = await postsRef.add({
      authorName,
      authorAvatar,
      content: content.trim(),
      createdAt: new Date().toISOString(),
      cheersCount: 0
    });

    return new Response(JSON.stringify({
      success: true,
      post: {
        id: newDoc.id,
        authorName,
        authorAvatar,
        content: content.trim(),
        createdAt: new Date().toISOString(),
        cheersCount: 0
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Failed to save thread post via Admin SDK API:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
