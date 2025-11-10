import { chromium } from 'playwright';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SCREENSHOTS_DIR = path.join(__dirname, '..', 'public', 'images', 'screenshots');

async function captureScreenshotsHeadless() {
  // Ensure screenshots directory exists
  if (!fs.existsSync(SCREENSHOTS_DIR)) {
    fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  }

  const browser = await chromium.launch({
    headless: true // Headless mode for CI/CD
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 2 // Higher resolution screenshots
  });
  
  const page = await context.newPage();
  
  try {
    console.log('🚀 Starting headless screenshot capture...');
    
    // Start the development server (assuming it's running on port 3000)
    console.log('📱 Navigating to localhost:3000...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    
    // Wait for the page to load completely
    await page.waitForTimeout(3000);
    
    // 1. Enhanced Search with Scope and Inline Results
    console.log('📸 Capturing enhanced search...');
    const searchInput = page.locator('[data-testid="search-input"], input[placeholder*="Search"]').first();
    if (await searchInput.isVisible()) {
      await searchInput.click();
      await searchInput.fill('premier');
      await page.waitForTimeout(2000); // Wait for search results
      await page.screenshot({ 
        path: path.join(SCREENSHOTS_DIR, 'enhanced-search.png'),
        fullPage: true
      });
      console.log('✅ Enhanced search screenshot saved');
    }
    
    // 2. Sidebar Tools (Favorites, Active, Today, Sorting, Refresh)
    console.log('📸 Capturing sidebar tools...');
    await page.screenshot({ 
      path: path.join(SCREENSHOTS_DIR, 'sidebar-tools.png'),
      fullPage: true
    });
    console.log('✅ Sidebar tools screenshot saved');
    
    // 3. Help Modal (Keyboard Shortcuts)
    console.log('📸 Capturing help modal...');
    const helpButton = page.locator('[data-testid="help-button"], button[aria-label*="Help"], button[title*="Help"]').first();
    if (await helpButton.isVisible()) {
      await helpButton.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ 
        path: path.join(SCREENSHOTS_DIR, 'help-modal.png'),
        fullPage: true
      });
      console.log('✅ Help modal screenshot saved');
      // Close the modal
      await page.keyboard.press('Escape');
    }
    
    // 4. Static Sidebar with Real Counts
    console.log('📸 Capturing static sidebar with counts...');
    // Navigate to a page that shows the static sidebar
    await page.goto('http://localhost:3000/countries', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({ 
      path: path.join(SCREENSHOTS_DIR, 'sidebar-static-counts.png'),
      fullPage: true
    });
    console.log('✅ Static sidebar counts screenshot saved');
    
    console.log('🎉 All screenshots captured successfully!');
    console.log(`📁 Screenshots saved to: ${SCREENSHOTS_DIR}`);
    
  } catch (error) {
    console.error('❌ Error capturing screenshots:', error);
  } finally {
    await browser.close();
  }
}

// Run the script
captureScreenshotsHeadless().catch(console.error);
