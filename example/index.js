import React from 'react';

export default function Example({text, url, background, imgUrl, imgAlt}) {
    return (
        <div className="example" style={{backgroundImage: `url(${background})`}}>
            <h2>{text}</h2>
            <a href={url}>
                <div className="awesomeness">
                    <img src={imgUrl} alt={imgAlt}/>
                </div>
            </a>
        </div>
    );
}

Example.displayName = 'Example';
