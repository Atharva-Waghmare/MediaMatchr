import React from 'react';
import { Film } from 'lucide-react';

function Footer() {
    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-content">
                    <div className="footer-logo">
                        <Film size={20} className="logo-icon" />
                        <span className="logo-text">MediaMatchr</span>
                    </div>
                    <div className="copyright">
                        © 2025 MediaMatchr. All rights reserved.
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer; 