// src/components/common/Footer.tsx
export function Footer() {
  return (
    <footer className="border-t bg-background px-6 py-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          © 2024 Enterprise CRM. All rights reserved.
        </p>
        <div className="flex gap-4 text-sm">
          <a href="/privacy" className="text-muted-foreground hover:text-foreground">Privacy</a>
          <a href="/terms" className="text-muted-foreground hover:text-foreground">Terms</a>
        </div>
      </div>
    </footer>
  )
}
