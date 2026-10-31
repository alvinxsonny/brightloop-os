# 🤝 GitHub Collaboration & Pushing Guide

> **Repository:** `https://github.com/alvinxsonny/brightloop-os.git`  
> **Target Branch:** `main`  
> **Team Workflow:** Direct pushes to `main` with linear rebase history.

---

## 1. Adding Collaborators (Repository Admin)

To give teammates permission to push code directly:
1. Go to: [github.com/alvinxsonny/brightloop-os/settings/access](https://github.com/alvinxsonny/brightloop-os/settings/access)
2. Click the green button: **Add people**.
3. Search each teammate by their GitHub username or email address.
4. Click **Add `<username>` to this repository**.
5. Teammates must accept the invite link sent to their email or visit:
   `https://github.com/alvinxsonny/brightloop-os/invitations`

---

## 2. Guide for Teammates (Share this with your team)

### A. First-Time Setup on Teammate Laptops

Open your terminal and run:

```bash
# 1. Clone the repository
git clone https://github.com/alvinxsonny/brightloop-os.git

# 2. Enter the directory
cd brightloop-os

# 3. Check you are on the main branch
git branch
```

---

### B. Daily Workflow: Pushing Directly to `main` Without Conflicts

Because everyone is pushing directly to `main`, follow this simple 3-step discipline every time you write code:

#### Step 1: Pull the latest changes before starting work
```bash
git pull --rebase origin main
```

#### Step 2: Stage and commit your changes locally
```bash
git add .
git commit -m "feat: brief description of what you did"
```

#### Step 3: Pull any work your teammates just pushed, then push
```bash
git pull --rebase origin main
git push origin main
```

> 💡 **Why `git pull --rebase`?**  
> Using `--rebase` places your new commits smoothly on top of whatever your teammates pushed, preventing unnecessary "Merge branch 'main' of github.com" merge-commits and avoiding ugly branch divergence.

---

## 3. Resolving Conflicts (If Teammates Edit the Same File)

If `git pull --rebase origin main` reports a conflict:
1. Open the file with conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`).
2. Keep the intended code and remove the conflict markers.
3. Save the file, then run:
   ```bash
   git add <resolved-file>
   git rebase --continue
   git push origin main
   ```
4. If you ever get stuck during a rebase and want to abort:
   ```bash
   git rebase --abort
   ```

---

## 4. Quick Cheatsheet

| Goal | Command |
| :--- | :--- |
| Check modified files | `git status` |
| Pull latest code safely | `git pull --rebase origin main` |
| Save local changes | `git add . && git commit -m "message"` |
| Push to GitHub | `git push origin main` |
| View recent commits | `git log --oneline -n 5` |
