# Fix syntax errors in GitHub Actions deploy workflow

The deploy.yml workflow uses incorrect variable substitution syntax (${ env.AWS_REGION } and ${ secrets.AWS_ACCOUNT_ID }) causing 'bad substitution' errors. Update the file to use proper GitHub Actions expression syntax ${{ env.AWS_REGION }} and ${{ secrets.AWS_ACCOUNT_ID }} throughout the workflow.
