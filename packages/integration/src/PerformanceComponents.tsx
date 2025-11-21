import React, { useState, useEffect, useRef, useCallback } from 'react';

interface VirtualListProps<T> {
	items: T[];
	itemHeight: number;
	containerHeight: number;
	renderItem: (item: T, index: number) => React.ReactNode;
	overscan?: number;
}

export function VirtualList<T>({
	items,
	itemHeight,
	containerHeight,
	renderItem,
	overscan = 3
}: VirtualListProps<T>) {
	const [scrollTop, setScrollTop] = useState(0);
	const containerRef = useRef<HTMLDivElement>(null);

	const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
		setScrollTop(e.currentTarget.scrollTop);
	}, []);

	const totalHeight = items.length * itemHeight;
	const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
	const endIndex = Math.min(
		items.length - 1,
		Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
	);

	const visibleItems = items.slice(startIndex, endIndex + 1);
	const offsetY = startIndex * itemHeight;

	return (
		<div
			ref={containerRef}
			style={{
				height: containerHeight,
				overflow: 'auto',
				position: 'relative'
			}}
			onScroll={handleScroll}
		>
			<div style={{ height: totalHeight, position: 'relative' }}>
				<div style={{ transform: `translateY(${offsetY}px)` }}>
					{visibleItems.map((item, index) => (
						<div key={startIndex + index} style={{ height: itemHeight }}>
							{renderItem(item, startIndex + index)}
						</div>
					))}
				</div>
			</div>
		</div>
	);
}

interface PaginatedListProps<T> {
	items: T[];
	pageSize: number;
	renderItem: (item: T, index: number) => React.ReactNode;
	renderEmpty?: () => React.ReactNode;
}

export function PaginatedList<T>({
	items,
	pageSize,
	renderItem,
	renderEmpty
}: PaginatedListProps<T>) {
	const [currentPage, setCurrentPage] = useState(1);

	const totalPages = Math.ceil(items.length / pageSize);
	const startIndex = (currentPage - 1) * pageSize;
	const endIndex = Math.min(startIndex + pageSize, items.length);
	const currentItems = items.slice(startIndex, endIndex);

	const goToPage = (page: number) => {
		setCurrentPage(Math.max(1, Math.min(page, totalPages)));
	};

	if (items.length === 0 && renderEmpty) {
		return <>{renderEmpty()}</>;
	}

	return (
		<div className="paginated-list">
			<div className="paginated-list-items">
				{currentItems.map((item, index) => renderItem(item, startIndex + index))}
			</div>

			{totalPages > 1 && (
				<div className="pagination-controls">
					<button
						onClick={() => goToPage(1)}
						disabled={currentPage === 1}
					>
						First
					</button>
					<button
						onClick={() => goToPage(currentPage - 1)}
						disabled={currentPage === 1}
					>
						Previous
					</button>
					<span className="page-info">
						Page {currentPage} of {totalPages}
					</span>
					<button
						onClick={() => goToPage(currentPage + 1)}
						disabled={currentPage === totalPages}
					>
						Next
					</button>
					<button
						onClick={() => goToPage(totalPages)}
						disabled={currentPage === totalPages}
					>
						Last
					</button>
				</div>
			)}
		</div>
	);
}

// Lazy loading component
interface LazyLoadProps {
	children: React.ReactNode;
	placeholder?: React.ReactNode;
	threshold?: number;
}

export function LazyLoad({ children, placeholder, threshold = 0.1 }: LazyLoadProps) {
	const [isVisible, setIsVisible] = useState(false);
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					setIsVisible(true);
					observer.disconnect();
				}
			},
			{ threshold }
		);

		if (ref.current) {
			observer.observe(ref.current);
		}

		return () => observer.disconnect();
	}, [threshold]);

	return <div ref={ref}>{isVisible ? children : placeholder}</div>;
}

// Memoized components
export const MemoizedArtifactCard = React.memo(
	({ artifact, onClick }: { artifact: any; onClick: (id: string) => void }) => {
		return (
			<div className="artifact-card" onClick={() => onClick(artifact.id)}>
				<h3>{artifact.type}</h3>
				<p>{artifact.content.substring(0, 100)}...</p>
			</div>
		);
	},
	(prevProps, nextProps) => prevProps.artifact.id === nextProps.artifact.id
);

export const MemoizedAgentCard = React.memo(
	({ agent, onSelect }: { agent: any; onSelect: (id: string) => void }) => {
		return (
			<div className="agent-card" onClick={() => onSelect(agent.id)}>
				<h3>{agent.name}</h3>
				<div className="status">{agent.status}</div>
				<div className="progress">{agent.progress}%</div>
			</div>
		);
	},
	(prevProps, nextProps) =>
		prevProps.agent.id === nextProps.agent.id &&
		prevProps.agent.status === nextProps.agent.status &&
		prevProps.agent.progress === nextProps.agent.progress
);
