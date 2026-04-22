import React from 'react';
import { Facebook, Twitter, Linkedin, Link2, Mail } from 'lucide-react';

interface SocialShareProps {
    url: string;
    title: string;
    description?: string;
}

export const SocialShare: React.FC<SocialShareProps> = ({ url, title, description }) => {
    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(title);

    const shareLinks = [
        {
            name: 'Facebook',
            icon: Facebook,
            url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
            color: 'bg-blue-600 hover:bg-blue-700'
        },
        {
            name: 'Twitter',
            icon: Twitter,
            url: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
            color: 'bg-sky-500 hover:bg-sky-600'
        },
        {
            name: 'LinkedIn',
            icon: Linkedin,
            url: `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}`,
            color: 'bg-blue-700 hover:bg-blue-800'
        },
        {
            name: 'Email',
            icon: Mail,
            url: `mailto:?subject=${encodedTitle}&body=${encodedUrl}`,
            color: 'bg-gray-600 hover:bg-gray-700'
        }
    ];

    const copyLink = () => {
        navigator.clipboard.writeText(url);
        alert('Link copiado!');
    };

    return (
        <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 mr-2">Compartilhar:</span>
            {shareLinks.map((link) => (
                <a
                    key={link.name}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`p-2 rounded-full text-white transition-colors ${link.color}`}
                    title={link.name}
                >
                    <link.icon size={18} />
                </a>
            ))}
            <button
                onClick={copyLink}
                className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
                title="Copiar link"
            >
                <Link2 size={18} />
            </button>
        </div>
    );
};
