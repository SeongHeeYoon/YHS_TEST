import { useEffect, useRef, useState } from 'react'
import './App.css'
import { saveScore, getTop } from './scoreApi'

const MIN_DELAY_MS = 1000
const MAX_DELAY_MS = 12000
const RANKING_SIZE = 5

// 화면 상태
// idle    : 시작 전 (파란 화면, 클릭하면 시작)
// waiting : 시작됨, 빨간색으로 바뀌길 기다리는 중 (파란 화면)
// ready   : 빨간 화면, 클릭 대기
// result  : 초록 화면, 결과 + 닉네임 입력 + 랭킹
// fail    : 빨간색이 되기 전에 클릭해서 실패
function App() {
  const [state, setState] = useState('idle')
  const [lastMs, setLastMs] = useState(null)
  const [nickname, setNickname] = useState('')
  const [saveStatus, setSaveStatus] = useState('idle') // idle | saving | done | error
  const [saveError, setSaveError] = useState('')
  const [topScores, setTopScores] = useState([])
  const [topError, setTopError] = useState('')

  const timeoutRef = useRef(null)
  const startTimeRef = useRef(0)

  useEffect(() => {
    return () => clearTimeout(timeoutRef.current)
  }, [])

  async function loadRanking() {
    try {
      const top = await getTop(RANKING_SIZE)
      setTopScores(top)
      setTopError('')
    } catch (err) {
      setTopScores([])
      setTopError(err.message || '랭킹을 불러오지 못했습니다.')
    }
  }

  function startGame() {
    setState('waiting')
    const delay = MIN_DELAY_MS + Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS)
    timeoutRef.current = setTimeout(() => {
      startTimeRef.current = performance.now()
      setState('ready')
    }, delay)
  }

  function handleFail() {
    clearTimeout(timeoutRef.current)
    setState('fail')
  }

  function handleHit() {
    const ms = performance.now() - startTimeRef.current
    setLastMs(Math.round(ms))
    setNickname('')
    setSaveStatus('idle')
    setSaveError('')
    setState('result')
    loadRanking()
  }

  function handleAreaClick() {
    if (state === 'idle') {
      startGame()
    } else if (state === 'waiting') {
      handleFail()
    } else if (state === 'ready') {
      handleHit()
    }
  }

  function handleRestart() {
    clearTimeout(timeoutRef.current)
    setState('idle')
  }

  async function handleSave(event) {
    event.preventDefault()
    if (!nickname.trim() || saveStatus === 'saving') return

    setSaveStatus('saving')
    setSaveError('')
    try {
      await saveScore(nickname, lastMs)
      setSaveStatus('done')
      loadRanking()
    } catch (err) {
      setSaveStatus('error')
      setSaveError(err.message || '저장에 실패했습니다.')
    }
  }

  if (state === 'result') {
    return (
      <div className="screen result">
        <h1>{lastMs}ms</h1>

        {saveStatus === 'done' ? (
          <p className="saved-message">기록이 저장되었습니다!</p>
        ) : (
          <form className="nickname-form" onSubmit={handleSave}>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="닉네임을 입력하세요"
              maxLength={20}
              autoFocus
            />
            <button type="submit" disabled={saveStatus === 'saving'}>
              {saveStatus === 'saving' ? '저장 중...' : '기록 저장'}
            </button>
          </form>
        )}
        {saveStatus === 'error' && <p className="error-message">{saveError}</p>}

        <div className="ranking">
          <h2>최고 기록 TOP {RANKING_SIZE}</h2>
          {topError && <p className="error-message">{topError}</p>}
          {!topError && topScores.length === 0 && <p>아직 기록이 없습니다.</p>}
          {!topError && topScores.length > 0 && (
            <ol>
              {topScores.map((score, index) => (
                <li key={score.id}>
                  <span className="rank">{index + 1}</span>
                  <span className="nickname">{score.nickname}</span>
                  <span className="ms">{score.ms}ms</span>
                </li>
              ))}
            </ol>
          )}
        </div>

        <button type="button" className="restart-button" onClick={handleRestart}>
          다시 도전
        </button>
      </div>
    )
  }

  if (state === 'fail') {
    return (
      <div className="screen fail" onClick={handleRestart}>
        <h1>너무 빨랐습니다!</h1>
        <p>빨간색으로 바뀌기 전에 클릭했습니다.</p>
        <button type="button" className="restart-button" onClick={handleRestart}>
          다시 시작
        </button>
      </div>
    )
  }

  return (
    <div
      className={`screen ${state === 'ready' ? 'ready' : 'idle'}`}
      onClick={handleAreaClick}
    >
      {state === 'idle' && <h1>클릭해서 시작</h1>}
      {state === 'waiting' && <h1>기다리세요...</h1>}
      {state === 'ready' && <h1>지금 클릭!</h1>}
    </div>
  )
}

export default App
