#!/bin/bash
# Domain Classification API - Quick Test Commands
# Save as: test_api.sh or test_api.bat (Windows)
# Usage: Run in terminal to quickly test all API endpoints

# Windows PowerShell version - save as test_api.ps1

# Test 1: Health Check
Write-Host "================================"
Write-Host "TEST 1: Health Check"
Write-Host "================================"
$response = Invoke-WebRequest -Uri "http://localhost:8000/" -Method GET
Write-Host $response.Content | ConvertFrom-Json | ConvertTo-Json

# Test 2: Single Classification
Write-Host "`n================================"
Write-Host "TEST 2: Single Classification"
Write-Host "================================"
$body = @{
    text = "The landlord hasn't returned my security deposit"
    top_k = 1
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "http://localhost:8000/classify" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body

Write-Host $response.Content | ConvertFrom-Json | ConvertTo-Json

# Test 3: Batch Classification
Write-Host "`n================================"
Write-Host "TEST 3: Batch Classification"
Write-Host "================================"
$body = @{
    texts = @(
        "Tenant rights and security deposits",
        "Labor law and workplace safety",
        "Consumer protection regulations"
    )
    top_k = 1
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "http://localhost:8000/classify/batch" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body

Write-Host $response.Content | ConvertFrom-Json | ConvertTo-Json

# Test 4: Model Info
Write-Host "`n================================"
Write-Host "TEST 4: Model Info"
Write-Host "================================"
$response = Invoke-WebRequest -Uri "http://localhost:8000/model/info" -Method GET
Write-Host $response.Content | ConvertFrom-Json | ConvertTo-Json

# Test 5: Top-K Predictions
Write-Host "`n================================"
Write-Host "TEST 5: Top-K Predictions (top_k=3)"
Write-Host "================================"
$body = @{
    text = "Labor and tenant rights documentation"
    top_k = 3
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "http://localhost:8000/classify" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body

Write-Host $response.Content | ConvertFrom-Json | ConvertTo-Json

Write-Host "`n✓ All tests complete!"
