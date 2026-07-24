# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-07-25

### Added
- Complete Production Launch on Firebase Hosting (`https://geodyssai.com`).
- Full DNS migration from ConoHa WING to Firebase Hosting with SSL/HTTPS.
- ADR-004 documentation in `docs/decisions.md`.

## [0.2.0] - 2026-07-21

### Added
- WXR parsing and Markdown/Astro compilation script `scripts/etl/01_parse.py`.
- Text embeddings generation script `scripts/etl/02_embed.py` using Google Cloud Vertex AI (model: `text-embedding-005`).
- UMAP 3D coordinate reduction and difficulty offset script `scripts/etl/03_neighbors_umap.py` using UMAP and Gemini 2.5 Flash.
- Cloud Firestore sync-upload script `scripts/etl/04_upload.py` utilizing Firebase Admin SDK batches.
- Configuration overrides for technical difficulties in `scripts/etl/config/difficulty_overrides.yaml`.
- Detailed learning notes in `docs/learning-notes.md`.
- WordPress blocks review report in `docs/review-list.md`.

### Changed
- Added `.json` intermediate data files to `.gitignore` to keep repository clean.
- Updated `AGENT.md` to include detailed instructions on GitHub Issue/PR based learning protocols.

## [0.1.0] - 2026-07-21

### Added
- Repository skeletal directory structure: `data/`, `docs/`, `logs/`, `public/assets/`, `scripts/etl/config/`.
- Moved WordPress WXR import source `geodyssai.WordPress.2026-07-19.xml` to `data/`.
- Moved mascot image `cat.jpg` to `public/assets/`.
- Constellation taxonomy configuration in `scripts/etl/config/taxonomy.yaml`.
- Preflight verification script in `scripts/preflight_check.py`.
- Preflight verification report in `docs/preflight-report.md`.
- Environment variable template `.env.example`.
