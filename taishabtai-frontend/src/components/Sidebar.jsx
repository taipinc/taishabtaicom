import React from 'react';

const Sidebar = ({pages, currentPage, onSelectPage, onPageHover}) => {
	const resolveValue = (page, key) => {
		if (!page) return '';
		if (page[key] !== undefined && page[key] !== null) return page[key];
		return page.attributes?.[key] ?? '';
	};

	const handleHomeClick = () => {
		window.location.href = '/';
	};

	// Group pages by their group property
	const groupOrder = ['Ongoing', 'Selected Works', 'Interactive', 'Other Works'];

	const groupedPages = groupOrder.reduce((acc, groupName) => {
		const pagesInGroup = pages
			.filter(page => resolveValue(page, 'group') === groupName)
			.sort((a, b) => {
				const orderA = resolveValue(a, 'order');
				const orderB = resolveValue(b, 'order');

				// If both have order values, sort by order
				if (orderA && orderB) {
					return orderA - orderB;
				}

				// If only one has an order value, prioritize it
				if (orderA) return -1;
				if (orderB) return 1;

				// If neither has order, sort alphabetically by title
				const titleA = resolveValue(a, 'title').toLowerCase();
				const titleB = resolveValue(b, 'title').toLowerCase();
				return titleA.localeCompare(titleB);
			});
		if (pagesInGroup.length > 0) {
			acc.push({ groupName, pages: pagesInGroup });
		}
		return acc;
	}, []);

	return (
		<div className='sidebar'>
			<h1
				onClick={handleHomeClick}
				onKeyDown={(event) => {
					if (event.key === 'Enter' || event.key === ' ') {
						event.preventDefault();
						handleHomeClick();
					}
				}}
				role='button'
				tabIndex={0}
				style={{cursor: 'pointer'}}
			>
				Shabtai Pinchevsky
			</h1>
			<hr />
			<p>
				I'm a photographer and digital media artist working at the intersection
				of architecture, archives, technology, and politics. In my works, I use
				3D modeling, mapping, internet-based tools, and more to examine archival
				photographic materials and their relations to geographies of conflict
				and displacement, especially in Israel / Palestine. My practice is
				engaged with issues of social justice and human rights, and their
				application in art and media
			</p>

			{groupedPages.map(({ groupName, pages: groupPages }) => (
				<div key={groupName} className='page-group'>
					<h3 className='group-title'>{groupName}</h3>
					<table className='page-table'>
						<tbody>
							{groupPages.map((page) => {
								const pageId = page.id || page.documentId;
								const currentPageId = currentPage?.id || currentPage?.documentId;
								const isActive = currentPageId === pageId;
								const title = resolveValue(page, 'title');
								const years = resolveValue(page, 'years');

								return (
									<tr
										key={pageId}
										className={`page-row${isActive ? ' page-row-active' : ''}`}
										onClick={() => onSelectPage(page)}
										onMouseEnter={() => onPageHover?.(page)}
										onMouseLeave={() => onPageHover?.(null)}
										onKeyDown={(event) => {
											if (event.key === 'Enter' || event.key === ' ') {
												event.preventDefault();
												onSelectPage(page);
											}
										}}
										role='button'
										tabIndex={0}
										aria-current={isActive ? 'page' : undefined}
									>
										<td className='page-title-cell'>{title}</td>
										<td className='page-years-cell'>{years}</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
			))}
		</div>
	);
};

export default Sidebar;
