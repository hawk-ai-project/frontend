'use client';

import { useEffect, useState } from 'react';

import { boardService } from '@/services/boardService';
import { getApiErrorMessage } from '@/services/apiClient';

import BoardFilter from './BoardFilter';
import BoardTable from './BoardTable';

export default function BoardList() {
  const [items, setItems] = useState([]);
  const [category, setCategory] = useState('전체');
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchBoards = async () => {
    try {
      setLoading(true);
      setError('');

      const data = await boardService.list({
        page,
        pageSize: 10,
        keyword: keyword.trim(),
        category: category === '전체' ? undefined : category,
      });

      setItems(Array.isArray(data.items) ? data.items : []);
      setTotalPages(data.totalPages ?? 0);
    } catch (error) {
      setItems([]);
      setTotalPages(0);
      setError(
        getApiErrorMessage(
          error,
          '게시글 목록을 불러오지 못했습니다.',
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoards();
  }, [page]);

  const search = (event) => {
    event.preventDefault();

    if (page === 1) {
      fetchBoards();
      return;
    }

    setPage(1);
  };

  return (
    <>
      <BoardFilter
        category={category}
        keyword={keyword}
        onCategoryChange={setCategory}
        onKeywordChange={setKeyword}
        onSubmit={search}
      />

      {loading && (
        <p className="board-state">
          게시글을 불러오는 중입니다.
        </p>
      )}

      {!loading && error && (
        <p className="board-state board-state-error">
          {error}
        </p>
      )}

      {!loading && !error && items.length === 0 && (
        <p className="board-state">
          등록된 게시글이 없습니다.
        </p>
      )}

      {!loading && !error && items.length > 0 && (
        <BoardTable items={items} />
      )}

      {!loading && !error && totalPages > 0 && (
        <nav
          className="number-pagination"
          aria-label="게시판 페이지"
        >
          <button
            type="button"
            disabled={page === 1}
            onClick={() => setPage((current) => current - 1)}
          >
            ‹
          </button>

          {Array.from(
            { length: totalPages },
            (_, index) => index + 1,
          ).map((number) => (
            <button
              type="button"
              className={page === number ? 'active' : ''}
              onClick={() => setPage(number)}
              key={number}
            >
              {number}
            </button>
          ))}

          <button
            type="button"
            disabled={page === totalPages}
            onClick={() => setPage((current) => current + 1)}
          >
            ›
          </button>
        </nav>
      )}
    </>
  );
}