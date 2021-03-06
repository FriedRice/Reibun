/**
 * GettingStartedTile component module. See [[GettingStartedTile]].
 */

import { Link } from 'react-router-dom';
import React from 'react';
import Tile from 'ts/components/generic/Tile';
import { getSearchUrl } from 'ts/app/search';

interface SampleSearch {
    query: string;
    explanation: string;
}

/** Sample searches to display in the component. */
const SAMPLE_SEARCHES: SampleSearch[] = [
    {
        query: '力士',
        explanation: 'A normal word',
    },
    {
        query: '非常に激しい雨',
        explanation: 'A set phrase',
    },
    {
        query: '急がば回れ',
        explanation: 'A proverb',
    },
    {
        query: '歯が立たない',
        explanation: 'An idiom',
    },
];

/**
 * Get the sample search li elements for the component.
 *
 * The li elements contain Link elements for each search.
 */
function getSampleSearchLis(): React.ReactElement[] {
    var sampleSearchLis: React.ReactElement[] = [];
    for (const sampleSearch of SAMPLE_SEARCHES) {
        sampleSearchLis.push(
            <li key={sampleSearch.query}>
                {`${sampleSearch.explanation} - `}
                <span lang='ja'>
                    <Link to={getSearchUrl(sampleSearch.query)}>
                        {sampleSearch.query}
                    </Link>
                </span>
            </li>
        );
    }
    return sampleSearchLis;
}

/**
 * Tile component with sample searches for MyakuWeb.
 *
 * @remarks
 * This component has no props.
 */
const GettingStartedTile: React.FC<{}> = function() {
    return (
        <Tile tileClasses='start-tile'>
            <h4 className='main-tile-header'>Getting Started</h4>
            <p className='list-start-text'>
                Here are some sample searches to get started:
            </p>
            <ul className='myaku-ul'>
                {getSampleSearchLis()}
            </ul>
        </Tile>
    );
};

export default GettingStartedTile;
