// 점수 저장/조회 전용 모듈.
// 화면(App.jsx)은 이 두 함수만 알면 되고, Firestore 관련 세부사항은 몰라도 된다.
import {
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore'
import { db, firebaseConfigured } from './firebase'

const SCORES_COLLECTION = 'scores'
const MAX_NICKNAME_LENGTH = 20

function assertConfigured() {
  if (!firebaseConfigured) {
    throw new Error(
      'Firebase 설정이 비어 있습니다. .env 파일에 VITE_FIREBASE_* 값을 채워주세요.',
    )
  }
}

/**
 * 반응속도 기록을 저장한다.
 * @param {string} nickname 닉네임 (앞뒤 공백 제거 후 최대 20자)
 * @param {number} ms 반응속도 (밀리초)
 */
export async function saveScore(nickname, ms) {
  assertConfigured()

  const trimmed = (nickname ?? '').trim()
  if (!trimmed) {
    throw new Error('닉네임을 입력해주세요.')
  }
  if (!Number.isFinite(ms) || ms <= 0) {
    throw new Error('유효하지 않은 기록입니다.')
  }

  await addDoc(collection(db, SCORES_COLLECTION), {
    nickname: trimmed.slice(0, MAX_NICKNAME_LENGTH),
    ms: Math.round(ms),
    createdAt: serverTimestamp(),
  })
}

/**
 * 가장 빠른(=값이 작은) 기록 상위 n개를 가져온다.
 * @param {number} n 가져올 개수
 * @returns {Promise<Array<{id: string, nickname: string, ms: number}>>}
 */
export async function getTop(n = 5) {
  assertConfigured()

  const topQuery = query(
    collection(db, SCORES_COLLECTION),
    orderBy('ms', 'asc'),
    limit(n),
  )
  const snapshot = await getDocs(topQuery)

  return snapshot.docs.map((doc) => {
    const data = doc.data()
    return { id: doc.id, nickname: data.nickname, ms: data.ms }
  })
}
